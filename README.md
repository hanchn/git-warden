# Git Warden 使用说明（傻瓜式教程）

> 🛡️ Git Warden：通过 `.gitlintrc.json` 配置自动约束 commit 格式、分支命名、合并行为。

---

## ✅ 1. 初始化项目（只做一次）

确保你当前目录是一个 Git 仓库：

```bash
git init  # 如果还没初始化 Git 仓库
```

然后执行以下命令安装依赖：

```bash
npm install --save-dev husky
```

---

## ✅ 2. 执行初始化脚本

```bash
node init-warden.js
```

它会自动：
- 初始化 Husky
- 添加 `.husky/commit-msg` 和 `.husky/pre-push` 钩子
- 自动写入 `node warden.js`（防止重复）
- 生成 `.gitlintrc.json` 默认配置

---

## ✅ 3. 开始使用

此时你无需手动操作，直接像往常一样开发：

```bash
git add .
git commit -m "feat(core): 初始化项目结构"  ✅ 格式正确
```

```bash
git commit -m "修复bug"  ❌ 报错！格式不对
```

```bash
git push  # 推送前自动检查分支/合并规则
```

---

## ✅ 4. 项目校验规则（默认）

- ✅ commit 格式：`<type>(<scope>): <subject>`
- ✅ commit 不能为空或纯符号
- ✅ 分支命名规范：如 `test`, `test/xxx`，不允许裸 `dev`
- ✅ 禁止某些分支合并到 master（如 test → master）
- ✅ 所有错误信息都为中文，且可在 `.gitlintrc.json` 自定义

---

## ✅ 5. 自定义配置：`.gitlintrc.json`

```json
{
  "forceCommitFormat": true,
  "commitFormat": "<type>(<scope>): <subject>",
  "allowedTypes": ["feat", "fix", "docs", "test", "refactor", "chore"],
  "branches": {
    "main": "^master$",
    "test": "^test(\/.*)?$",
    "pre": "^pre(\/.*)?$",
    "dev": "^dev\/.+$"
  },
  "restrictMerge": [
    { "from": "^test(\/.*)?$", "to": "^master$" },
    { "from": "^pre(\/.*)?$", "to": "^master$" },
    { "from": "^dev\/.+$", "to": "^master$" }
  ],
  "messages": {
    "emptyCommit": "❌ commit 信息不能为空，且不能是纯符号，请填写有意义的提交内容",
    "badFormat": "❌ commit 信息格式错误，必须符合格式：<type>(<scope>): <subject>",
    "badType": "❌ commit 类型不在允许范围内，请使用以下类型之一：",
    "badBranch": "❌ 当前分支不符合命名规范，具体规范如下：",
    "badMerge": "❌ 禁止将该分支合并到目标分支，请检查合并策略"
  }
}
```

---

## ✅ 常见问题排查

| 问题                                       | 解决方案                                       |
|--------------------------------------------|------------------------------------------------|
| 报错：`.husky/_/husky.sh: No such file`     | 执行 `npx husky install` 修复                   |
| 钩子文件无权限执行                         | 运行 `chmod +x .husky/commit-msg`               |
| `node` 命令未找到                          | 确保本机已安装 Node.js 并加入环境变量           |

---

## 🎉 完成！

你的 Git 项目现在已经被 Git Warden 接管，任何提交/推送都会自动校验。

有问题随时执行：
```bash
node warden.js  # 手动运行校验
```

欢迎升级为 CLI 工具发布，支持团队一键集成！