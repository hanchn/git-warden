以下是为你的 Git 提交规范工具 **Git Warden** 量身定制的 `README.md` 内容，包含一键安装、使用指南、规则说明、交互式提交示例等内容，非常适合放入项目根目录：

---

## 🛡 Git Warden 提交规范守卫工具

通过 Git 钩子自动校验 commit 信息和分支命名，确保团队协作规范统一。支持交互式提交、一键初始化配置。

---

### 🚀 一键安装

```bash
npx husky install
npx husky add .husky/commit-msg "node warden.js"
```

> ✅ 确保项目根目录已有 `warden.js` 和 `.gitlintrc.json` 配置文件。

---

### 📦 使用方式

#### ✅ 常规提交（自动校验格式）

```bash
git commit -m "feat(user): 新增用户注册接口"
```

#### ✅ 推荐方式：交互式提交（不再手写 commit）

```bash
node warden.js --prompt
git commit
```

---

### 🧩 支持的提交类型（type）

| 类型         | 说明                      |
| ---------- | ----------------------- |
| `feat`     | ✨ 新功能：新增功能、新页面、新接口等     |
| `fix`      | 🐞 修复：修复 bug、逻辑问题、样式错位等 |
| `docs`     | 📚 文档：更新说明文档、注释、README  |
| `test`     | 🧪 测试：添加或修改测试代码         |
| `refactor` | 🔧 重构：不影响功能的代码优化、结构重组   |
| `chore`    | 🔩 杂务：构建配置、依赖升级、CI 等    |
| `work`     | 🚧 临时提交：中间状态、未完成任务的占位提交 |

---

### 🔐 校验规则一览

* ✅ commit message 格式必须为：

  * `type(scope): 内容说明` 或
  * `type: 内容说明`

* ❌ 不允许纯符号或空内容（如 `"!!!"`、`""`）

* ✅ 分支命名规范（默认）：

  * `master`、`test/xxx`、`pre/xxx`、`dev/xxx`（不允许裸 `dev`）

* ❌ 禁止以下合并操作：

  * `test → master`
  * `pre → master`
  * `dev/* → master`

---

### 🛠 配置说明（`.gitlintrc.json`）

你可以自定义校验规则、允许的类型、中文提示文本等。

```json
{
  "forceCommitFormat": true,
  "allowedTypes": ["feat", "fix", "docs", "test", "refactor", "chore", "work"],
  "messages": {
    "emptyCommit": "提交信息不能为空或仅为符号",
    "badFormat": "提交格式错误，应为 <type>(<scope>): <subject>",
    ...
  }
}
```

---

### ✅ 推荐搭配

* [husky](https://typicode.github.io/husky/)：Git Hook 管理器
* [inquirer](https://www.npmjs.com/package/inquirer)：交互式命令行
* [lint-staged](https://github.com/okonet/lint-staged)：搭配代码格式化

---


### ❤️ 示例提交命令

```bash
# 交互式方式更友好（推荐）
node warden.js --prompt && git commit

# 手写方式（确保格式正确）
git commit -m "fix(api): 修复接口返回异常"
```

---

是否还需要我加一个「错误示例 vs 正确示例」的 commit 对照表？
