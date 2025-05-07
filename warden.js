#!/usr/bin/env node
console.log('🟢 执行的是最新 warden.js');

import fs from 'fs';
import { execSync } from 'child_process';

const defaultConfig = {
  forceCommitFormat: true,
  commitFormat: "<type>(<scope>): <subject>",
  allowedTypes: ["feat", "fix", "docs", "test", "refactor", "chore"],
  branches: {
    main: "^master$",
    test: "^test(\\/.*)?$",
    pre: "^pre(\\/.*)?$",
    dev: "^dev\\/.+$" // 禁止裸 dev
  },
  restrictMerge: [
    { from: "^test(\\/.*)?$", to: "^master$" },
    { from: "^pre(\\/.*)?$", to: "^master$" },
    { from: "^dev\\/.+$", to: "^master$" }
  ],
  messages: {
    emptyCommit: "❌ commit 信息不能为空，且不能是纯符号，请填写有意义的提交内容",
    badFormat: "❌ commit 信息格式错误，必须符合格式：<type>(<scope>): <subject> 或 <type>: <subject>",
    badType: "❌ commit 类型不在允许范围内，请使用以下类型之一：",
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
    return execSync('git log -1 --pretty=%B').toString().trim();
  } catch {
    console.warn('⚠️ 当前分支尚无提交，跳过 commit message 校验');
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
  // 调试输出
  console.log('commit message:', trimmed);
  console.log('hasMeaningfulChar:', [...trimmed].some(char => /[a-zA-Z0-9\u4e00-\u9fa5]/.test(char)));

  // 至少包含一个字母、数字或中文字符
  const hasMeaningfulChar = [...trimmed].some(char =>
    /[a-zA-Z0-9\u4e00-\u9fa5]/.test(char)
  );

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
    console.error(`❌ ${config.messages.badType}${config.allowedTypes.join('、')}`);
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

// 新增：优先从参数读取 commit message 文件内容
const commitMsgFile = process.argv[2];
let commitMsg = '';
if (commitMsgFile && fs.existsSync(commitMsgFile)) {
  commitMsg = fs.readFileSync(commitMsgFile, 'utf8');
} else {
  commitMsg = getLastCommitMessage();
}

const runChecks = () => {
  const branch = getCurrentBranch();
  validateBranchName(branch);
  validateCommitMessage(commitMsg);
  validateMergeRules();

  console.log("✅ Git 校验通过");
};

runChecks();
