#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// 默认配置
const defaultConfig = {
  forceCommitFormat: true,
  commitFormat: "<type>(<scope>): <subject>",
  allowedTypes: ["feat", "fix", "docs", "test", "refactor", "chore"],
  branches: {
    main: "^master$",
    test: "^test\\/.*$",
    pre: "^release\\/.*$"
  },
  restrictMerge: [
    { from: "^test\\/.*$", to: "^master$" }
  ]
};

// 加载用户配置（如存在 .gitlintrc.json）
let config = defaultConfig;
if (fs.existsSync('.gitlintrc.json')) {
  const userConfig = JSON.parse(fs.readFileSync('.gitlintrc.json', 'utf8'));
  config = { ...defaultConfig, ...userConfig };
}

// 获取当前分支名
const getCurrentBranch = () => {
  return execSync('git symbolic-ref --short HEAD').toString().trim();
};

// 获取最近一次提交信息
const getLastCommitMessage = () => {
  try {
    return execSync('git log -1 --pretty=%B').toString().trim();
  } catch {
    console.warn('⚠️ 当前分支尚无提交，跳过 commit message 校验');
    return '';
  }
};

// 校验分支名
const validateBranchName = (branch) => {
  const valid = Object.values(config.branches).some(pattern => new RegExp(pattern).test(branch));
  if (!valid) {
    console.error(`❌ 当前分支 "${branch}" 不符合命名规范`);
    process.exit(1);
  }
};

// 校验 commit 格式
const validateCommitMessage = (msg) => {
  if (!config.forceCommitFormat || !msg) return;

  const regex = /^(\w+)(\(\w+\))?: .+/;
  if (!regex.test(msg)) {
    console.error(`❌ commit 格式不正确，应为：${config.commitFormat}`);
    process.exit(1);
  }

  const type = msg.split('(')[0];
  if (!config.allowedTypes.includes(type)) {
    console.error(`❌ commit type "${type}" 不在允许列表中：${config.allowedTypes.join(', ')}`);
    process.exit(1);
  }
};

// 校验合并规则
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
        console.error(`❌ 禁止将 "${from}" 合并到 "${to}"`);
        process.exit(1);
      }
    }
  } catch {
    // 非 merge commit 忽略
  }
};

// 主执行函数
const runChecks = () => {
  const branch = getCurrentBranch();
  const commitMsg = getLastCommitMessage();

  validateBranchName(branch);
  validateCommitMessage(commitMsg);
  validateMergeRules();

  console.log("✅ Git 校验通过");
};

runChecks();
