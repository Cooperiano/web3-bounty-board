# Web3 区块链全栈工程师求职准备计划

> 来源：面试岗位分析 + 项目准备方案（2026-06-15）

---

## 一、这个岗位到底要什么

岗位名称：区块链全栈工程师 / 远程居家办公 / 20–40K

它不是只要 Solidity，也不是只要前端，而是要你能做：

**前端 DApp + 后端 API + 智能合约 + 链上交互 + 部署监控。**

你需要覆盖这些关键词：

| 模块 | 岗位要求 | 你要准备的证据 |
|------|----------|----------------|
| 前端 | React / Next.js / TypeScript / Tailwind | 一个可访问的 DApp 页面 |
| 钱包连接 | Web3.js / Ethers.js / viem / Wagmi / RainbowKit | Connect Wallet、切链、签名、发交易 |
| 合约 | Solidity / Rust / EVM | 一个部署到测试网的合约 |
| 合约工具 | Hardhat / Foundry | 部署脚本、测试脚本 |
| 后端 | Node.js / NestJS / Express | 记录交易、用户地址、任务状态 |
| 数据库 | PostgreSQL / MongoDB / Redis | 简单存交易记录即可 |
| 安全 | 合约审计、安全最佳实践 | 能讲防重入、权限控制、输入校验 |
| 工程化 | GitHub / CI/CD / 部署 / 监控 | README、部署地址、GitHub Actions |
| Web3 业务 | DeFi、跨链、The Graph/SubQuery | 不需要深做，但要能解释概念 |

---

## 二、你短时间最应该补的项目

建议做一个：**Web3 Task Reward / Bounty DApp**（链上任务悬赏平台）

这个项目非常适合，因为它能同时展示：

- 钱包连接
- Solidity 合约
- 资金托管
- 交易签名
- 前端 DApp
- 后端 API
- 数据库记录
- 事件监听
- 合约安全
- 工程化部署

而且它比单纯 NFT Mint 更像真实业务。

---

## 三、项目设计：Web3 悬赏任务平台

### 项目一句话介绍

一个基于 EVM 测试网的链上任务悬赏平台，用户可以连接钱包发布悬赏任务，将 ETH 托管到智能合约中，完成者提交结果后由发布者确认并释放奖励，后端记录任务、交易状态和链上事件。

---

## 四、项目功能清单

### 1. 前端功能

Next.js 页面，包含：

- 连接钱包
- 显示当前钱包地址
- 显示当前网络
- 创建任务（输入任务标题、描述、赏金金额）
- 调用合约创建 bounty
- 查看任务列表
- 接取任务 / 提交结果
- 发布者确认完成
- 合约释放赏金
- 显示交易 hash
- 显示交易状态：pending / confirmed / failed

技术栈：Next.js、TypeScript、Tailwind CSS、Wagmi、Viem、RainbowKit

### 2. 智能合约功能

**BountyBoard.sol** 核心逻辑：

- `createBounty()` — 发布任务并托管 ETH
- `submitWork()` — 完成者提交结果
- `approveWork()` — 发布者确认并释放赏金
- `cancelBounty()` — 发布者取消未接取任务
- `withdraw()` — 提现或退款

合约状态：Open → Submitted → Approved / Cancelled

安全点：`onlyCreator`、`nonReentrant`、状态检查、金额检查、不能重复领取、使用 OpenZeppelin `ReentrancyGuard`

### 3. 后端功能

Express + TypeScript，SQLite/PostgreSQL

API：

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tx`
- `GET /api/tx/:hash`

记录：任务标题、描述、发布者钱包地址、合约 bountyId、交易 hash、链 ID、状态、创建/更新时间

### 4. 链上事件监听

合约事件：

```solidity
event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 amount);
event WorkSubmitted(uint256 indexed bountyId, address indexed worker);
event BountyApproved(uint256 indexed bountyId, address indexed worker, uint256 amount);
event BountyCancelled(uint256 indexed bountyId);
```

后端监听事件并同步数据库状态。

---

## 五、项目目录建议

```
web3-bounty-board/
  contracts/
    BountyBoard.sol
  scripts/
    deploy.ts
  test/
    BountyBoard.test.ts
  backend/
    src/
      index.ts
      routes/
      db/
      listener.ts
  frontend/
    app/
    components/
    lib/
  README.md
  .env.example
  docker-compose.yml
```

---

## 六、你要准备的材料清单

1. **GitHub 仓库**（README 写得像正式项目）
2. **在线访问地址**（前端 Vercel + 后端 Render/Railway）
3. **测试网合约地址**（Sepolia）
4. **项目截图**（连接钱包、创建任务、交易成功、Etherscan）
5. **简历项目描述**
6. **给 HR 的沟通话术**

### 简历项目描述

> **Web3 Bounty Board｜链上任务悬赏 DApp**
> 基于 Next.js、TypeScript、Wagmi、Viem、RainbowKit、Solidity、Hardhat、Node.js 构建的 Web3 全栈项目。实现钱包连接、任务发布、ETH 托管、工作提交、发布者确认、合约释放奖励等完整链上流程。智能合约部署至 Sepolia 测试网，使用 OpenZeppelin ReentrancyGuard 做重入保护，并通过事件监听同步链上状态到后端数据库。

---

## 七、技术补课清单

### 第一优先级（必须会）
Solidity 基础语法、`msg.sender` / `msg.value`、mapping / struct / enum、modifier、event、require / revert、payable、合约部署、合约 ABI、Etherscan 查看交易

### 第二优先级（DApp 开发必须会）
Wagmi、Viem、RainbowKit、Connect Wallet、`writeContract`、`readContract`、`waitForTransactionReceipt`、`switchNetwork`、chainId、transaction hash

### 第三优先级（合约工程工具）
Hardhat、部署脚本、测试脚本、`.env` 私钥管理、Sepolia RPC、合约验证 verify

### 第四优先级（安全面试常问）
重入攻击 Reentrancy、权限控制 `onlyOwner` / `onlyCreator`、整数溢出 Solidity 0.8+、Checks-Effects-Interactions、合约升级 Proxy 基本概念、私钥安全、前端输入校验、链上链下状态一致性

---

## 八、执行路线（Claude Code / Cursor 分步 Prompt）

### 第 1 步：合约
创建 Solidity + Hardhat 项目，实现 BountyBoard 合约 + 测试

### 第 2 步：前端
基于 Next.js + TypeScript + Tailwind + Wagmi + Viem + RainbowKit 创建 DApp 前端

### 第 3 步：后端
Node.js + Express + TypeScript 后端 + 事件监听

### 第 4 步：README
高质量求职展示 README

---

## 九、投简历定位

> 我是全栈/AI 工程化背景，最近系统补充 Web3 应用层开发，并做了一个完整 DApp 项目，覆盖钱包连接、Solidity 合约、测试网部署、链上交互、后端交易记录和事件监听。我适合 Web3 应用层全栈开发岗位。

---

## 十、面试项目故事（1 分钟版本）

我做的是一个 Web3 任务悬赏平台。用户连接钱包后可以创建任务，并把 ETH 托管到智能合约里。完成者提交结果后，发布者确认，合约自动把赏金释放给完成者。

技术上，前端使用 Next.js、TypeScript、Wagmi、Viem、RainbowKit；合约使用 Solidity 和 Hardhat；后端用 Node.js 记录链下任务元数据和交易状态；同时监听合约事件，把链上状态同步到数据库。

我重点关注了交易状态、链上事件、权限控制、防重入和链上链下状态一致性。

---

## 十一、时间安排（最快 3 天版本）

| 天 | 目标 |
|----|------|
| Day 1 | Hardhat 项目跑通、BountyBoard.sol 完成、测试脚本、Sepolia 部署 |
| Day 2 | 前端：钱包连接、创建/读取 bounty、提交/确认 work、交易状态 |
| Day 3 | 后端 API、交易记录、事件监听、README、截图、部署 |

---

## 十二、最终交付物清单

1. GitHub 仓库
2. Vercel 在线 Demo
3. Sepolia 合约地址
4. Etherscan 交易链接
5. 项目截图
6. 简历项目描述
7. 给 HR 的沟通话术

> 做到这个程度，你就可以投了。
