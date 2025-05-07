import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const huskyDir = '.husky';
const hooks = ['commit-msg', 'pre-push'];
const hookCommand = 'node warden.js';
const defaultConfigPath = '.gitlintrc.json';

function log(msg) {
  console.log(`🛠 ${msg}`);
}

// 1. 初始化 husky
function initHusky() {
  if (!fs.existsSync(huskyDir)) {
    log('初始化 Husky...');
    execSync('npx husky install', { stdio: 'inherit' });
  } else {
    log('已存在 .husky 目录，跳过初始化');
  }
}

// 2. 添加指定 hook 并写入命令（去重）
function addHook(name) {
  const hookPath = path.join(huskyDir, name);
  const huskyHeader = '. "$(dirname "$0")/_/husky.sh"';

  if (!fs.existsSync(hookPath)) {
    execSync(`npx husky add ${hookPath} ""`, { stdio: 'inherit' });
  }

  let content = fs.readFileSync(hookPath, 'utf8');

  if (!content.includes(huskyHeader)) {
    content = `#!/bin/sh\n${huskyHeader}\n`;
  }

  if (!content.includes(hookCommand)) {
    content += `\n${hookCommand}\n`;
    fs.writeFileSync(hookPath, content, { mode: 0o755 });
    log(`添加钩子：${name}`);
  } else {
    log(`钩子 ${name} 已包含 warden.js 调用，跳过`);
  }
}

// 3. 生成默认配置文件（如不存在）
function generateConfig() {
  if (fs.existsSync(defaultConfigPath)) {
    log(`${defaultConfigPath} 已存在，跳过生成`);
    return;
  }

  const config = {
    forceCommitFormat: true,
    commitFormat: "<type>(<scope>): <subject>",
    allowedTypes: ["feat", "fix", "docs", "test", "refactor", "chore"],
    branches: {
      main: "^master$",
      test: "^test(\\/.*)?$",
      pre: "^pre(\\/.*)?$",
      dev: "^dev\\/.+$"
    },
    restrictMerge: [
      { from: "^test(\\/.*)?$", to: "^master$" },
      { from: "^pre(\\/.*)?$", to: "^master$" },
      { from: "^dev\\/.+$", to: "^master$" }
    ],
    messages: {
      emptyCommit: "❌ commit 信息不能为空，且不能是纯符号，请填写有意义的提交内容",
      badFormat: "❌ commit 信息格式错误，必须符合格式：<type>(<scope>): <subject>",
      badType: "❌ commit 类型不在允许范围内，请使用以下类型之一：",
      badBranch: "❌ 当前分支不符合命名规范，具体规范如下：",
      badMerge: "❌ 禁止将该分支合并到目标分支，请检查合并策略"
    }
  };

  fs.writeFileSync(defaultConfigPath, JSON.stringify(config, null, 2));
  log(`生成默认配置文件：${defaultConfigPath}`);
}

// 执行流程
initHusky();
hooks.forEach(addHook);
generateConfig();
log('✅ Git Warden 初始化完成');
