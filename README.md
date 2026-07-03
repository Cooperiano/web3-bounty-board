# Web3 Bounty Board

链上任务悬赏 DApp — 基于 EVM 测试网的 Web3 全栈项目。

用户连接钱包发布悬赏任务，将 ETH 托管到智能合约中，完成者提交结果后由发布者确认并释放奖励。后端记录任务、交易状态和链上事件。

## 技术栈

| 层 | 技术 |
|---|------|
| 合约 | Solidity, Hardhat, OpenZeppelin |
| 前端 | Next.js, TypeScript, Tailwind CSS, Wagmi, Viem, RainbowKit |
| 后端 | Node.js, Express, TypeScript, SQLite |

## 项目结构

```
web3-bounty-board/
├── contracts/          # Solidity 智能合约
│   ├── contracts/      # BountyBoard.sol
│   ├── scripts/        # 部署脚本
│   └── test/           # 合约测试
├── frontend/           # Next.js DApp 前端
│   └── src/
│       ├── app/        # 页面
│       ├── components/ # React 组件
│       ├── hooks/      # 合约交互 hooks
│       └── lib/        # ABI + 配置
├── backend/            # Express API + 事件监听
│   └── src/
│       ├── routes/     # API 路由
│       ├── db.ts       # SQLite 数据库
│       ├── index.ts    # Express 服务
│       └── listener.ts # 链上事件监听
└── docs/               # 项目规划文档
```

## 快速开始

### 前置条件

- Node.js >= 22
- Sepolia 测试网 ETH（可通过水龙头获取）

### 1. 合约

```bash
cd contracts
cp .env.example .env   # 填入 PRIVATE_KEY 和 RPC URL
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia
```

### 2. 前端

```bash
cd frontend
cp .env.example .env   # 填入 WalletConnect Project ID 和合约地址
npm install
npm run dev             # http://localhost:3000
```

### 3. 后端

```bash
cd backend
cp .env.example .env   # 填入合约地址
npm install
npm run dev             # API 运行在 http://localhost:3001

# 事件监听（另一个终端）
npm run listen          # 监听合约事件并同步数据库
```

## 合约地址

| 网络 | 地址 |
|------|------|
| Sepolia | `待部署` |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 获取所有任务 |
| GET | `/api/tasks/:id` | 获取单个任务 |
| POST | `/api/tasks` | 创建任务记录 |
| PATCH | `/api/tasks/:id` | 更新任务状态 |
| POST | `/api/tx` | 记录交易 |
| GET | `/api/tx/:hash` | 查询交易 |
| GET | `/api/health` | 健康检查 |

## 合约功能

- `createBounty(title, description)` — 发布任务并托管 ETH
- `submitWork(bountyId)` — 完成者提交结果
- `approveWork(bountyId)` — 发布者确认并释放赏金
- `cancelBounty(bountyId)` — 发布者取消未接取任务

合约状态: Open → Submitted → Approved / Cancelled

安全措施: ReentrancyGuard, onlyCreator modifier, Checks-Effects-Interactions, 状态校验

## 部署

- 前端: Vercel
- 后端: Render / Railway
- 合约: Sepolia 测试网

## License

MIT
