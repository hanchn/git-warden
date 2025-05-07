# README.md

## 📦 Git Warden

一个用于规范 Git 操作的自动校验工具。通过 `.gitlintrc.json` 配置自定义 commit 规范、分支命名和合并限制。

---

## 📥 安装

```bash
# 安装 husky（如未安装）
npm install --save-dev husky
npx husky install

# 添加 Git hook
npx husky add .husky/commit-msg "node warden.js"
npx husky add .husky/pre-push "node warden.js"
```

---

## ⚙️ 使用

确保根目录下存在 `.gitlintrc.json` 配置文件，示例见下方。

每次执行 `git commit` 或 `git push` 时，会自动执行 `warden.js` 进行如下检查：

- 当前分支名是否符合规范
- commit message 是否符合格式要求，内容不得为空或纯符号
- 是否存在被禁止的 merge 行为（如 test → master）

如有任何不符合规范的行为，提交将被中止，并显示详细的中文错误信息。

---

## 🛠 示例 `.gitlintrc.json`

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
    "emptyCommit": "commit 信息不能为空，且不能是纯符号，请填写有意义的提交内容",
    "badFormat": "commit 信息格式错误，必须符合格式：<type>(<scope>): <subject>",
    "badType": "commit 类型不在允许范围内，请使用以下类型之一：",
    "badBranch": "当前分支不符合命名规范，具体规范如下：",
    "badMerge": "禁止将该分支合并到目标分支，请检查合并策略"
  }
}
```

---

## ✅ 建议搭配

- commitizen（配合交互式提交）
- conventional-changelog（生成 CHANGELOG）

---

## 👨‍💻 作者

