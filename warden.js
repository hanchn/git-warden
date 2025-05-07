// warden.js
//#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

const defaultConfig = {
  forceCommitFormat: true,
  commitFormat: "<type>(<scope>): <subject>",
  allowedTypes: ["feat", "fix", "docs", "test", "refactor", "chore", "work"],
  branches: {
    main: "^master$",
    test: "^test(\/.*)?$|^test$",
    pre: "^pre(\/.*)?$|^pre$",
    dev: "^dev(\/.*)?$|^dev$" // 允许 dev 和 dev/xxx
  },
  restrictMerge: [
    { "from": "^test(\/.*)?$|^test$", "to": "^master$" },
    { "from": "^pre(\/.*)?$|^pre$", "to": "^master$" },
    { "from": "^dev(\/.*)?$|^dev$", "to": "^master$" }
  ],
  messages: {
    emptyCommit: "❌ commit 信息不能为空，且不能是纯符号，请填写有意义的提交内容",
    badFormat: "❌ commit 信息格式错误，必须符合格式：<type>(<scope>): <subject> 或 <type>: <subject>\n例如：fix(login): 修复登录按钮样式",
    badType: "❌ commit 类型不在允许范围内，请使用以下类型之一：\n- feat: 新功能（如新增页面、功能）\n- fix: 修复 bug\n- docs: 修改文档\n- test: 添加/修改测试\n- refactor: 重构（不影响功能）\n- chore: 构建流程或工具变更\n- work: 临时开发提交（建议后续整理）",
    badBranch: "❌ 当前分支不符合命名规范，具体规范如下：",
    badMerge: "❌ 禁止将该分支合并到目标分支，请检查合并策略"
  }
};

let config = defaultConfig;
if (fs.existsSync('.gitlintrc.json')) {
  const userConfig = JSON.parse(fs.readFileSync('.gitlintrc.json', 'utf8'));
  config = { ...defaultConfig, ...userConfig };
}

const getCurrentBranch = () => {
  return execSync('git symbolic-ref --short HEAD').toString().trim();
};

const getLastCommitMessage = () => {
  try {
    return fs.readFileSync('.git/COMMIT_EDITMSG', 'utf8').trim();
  } catch {
    return '';
  }
};

const validateBranchName = (branch) => {
  const match = Object.entries(config.branches).some(([_, pattern]) => {
    return new RegExp(pattern).test(branch);
  });

  if (!match) {
    const rules = Object.entries(config.branches)
      .map(([name, pattern]) => `${name} 分支应匹配正则：${pattern}`)
      .join('\n');
    console.error(`❌ ${config.messages.badBranch}\n${rules}`);
    process.exit(1);
  }
};

const validateCommitMessage = (msg) => {
  if (!config.forceCommitFormat || !msg) return;

  const trimmed = msg.trim();
  const hasMeaningfulChar = [...trimmed].some(char => /[a-zA-Z0-9\u4e00-\u9fa5]/.test(char));

  if (!trimmed || !hasMeaningfulChar) {
    console.error(`❌ ${config.messages.emptyCommit}`);
    process.exit(1);
  }

  const regex = /^(\w+)(\(\w+\))?: .+/;
  const match = trimmed.match(regex);
  if (!match) {
    console.error(`❌ ${config.messages.badFormat}`);
    process.exit(1);
  }

  const type = match[1];
  if (!config.allowedTypes.includes(type)) {
    console.error(`❌ ${config.messages.badType}`);
    process.exit(1);
  }
};

const validateMergeRules = () => {
  try {
    const output = execSync('git log -1 --merges --pretty=%P').toString().trim();
    if (!output) return;

    const [from, to] = output.split(' ');
    if (!from || !to) return;

    for (const rule of config.restrictMerge) {
      const fromMatch = new RegExp(rule.from).test(from);
      const toMatch = new RegExp(rule.to).test(to);
      if (fromMatch && toMatch) {
        console.error(`❌ ${config.messages.badMerge}`);
        process.exit(1);
      }
    }
  } catch {}
};

const promptCommit = async () => {
  const { type, scope, subject } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: '请选择提交类型：',
      choices: config.allowedTypes
    },
    {
      type: 'input',
      name: 'scope',
      message: '请输入作用域（例如 login、user、api）：'
    },
    {
      type: 'input',
      name: 'subject',
      message: '请输入提交说明：',
      validate: input => /[a-zA-Z0-9\u4e00-\u9fa5]/.test(input) || '提交说明不能为空且必须包含文字'
    }
  ]);

  const fullCommit = `${type}${scope ? `(${scope})` : ''}: ${subject}`;
  fs.writeFileSync('.git/COMMIT_EDITMSG', fullCommit);
  console.log(`✨ 已生成提交信息：\n${fullCommit}`);
};

const runChecks = async () => {
  const args = process.argv.slice(2);
  if (args.includes('--prompt')) {
    await promptCommit();
    return;
  }

  const branch = getCurrentBranch();
  const commitMsg = getLastCommitMessage();

  validateBranchName(branch);
  validateCommitMessage(commitMsg);
  validateMergeRules();

  console.log("✅ Git 校验通过");
};

runChecks();