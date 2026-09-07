# 拜松的单车实验室 · Bison Bike Lab

面向骑行新手的交互网站：从传动和车架两个实验室，理解自行车的速度、几何与骑姿。

## 页面

- `/`：实验室首页，导航到两个同级实验室。
- `/drivetrain`：原传动实验室，牙盘、飞轮、轮径和踏频的交互演示。
- `/frame`：Stack / Reach / STR 动态测量、同 STR 不同尺寸对比，以及把组调整和选车基础。
- 所有页面共享导航、Logo 和服务端访客 / 浏览计数器。

网站 Logo 使用用户提供的拜松像素头像，原样保存在 `public/bison-logo.png`，用于页头、页尾和浏览器图标。

- 五种牙盘、五种飞轮组、五种带明确轮胎规格的车轮。
- 逐片选择飞轮齿数、0–140 rpm 踏频、公路/山地/折叠示例预设。
- 传动动画、暂停和单圈慢速演示、同踏频车型对比。
- 尺寸来源、计算假设以及风阻、滚阻和骑手功率的解释。
- 手机布局、键盘选择、减少动态效果偏好；可用浏览器中的 WebMCP 读写演示配置。

## 本地运行

使用 Node.js 22.13 或更新版本安装依赖，然后运行：

```powershell
npm install
npm run db:migrate:local
npm run dev -- --host 127.0.0.1 --port 3000
```

打开 http://localhost:3000/ 。

## 验证

```powershell
npm run build
npx tsc --noEmit
npm test
```

测试直接运行 TypeScript，需 Node.js 22.18+；较早的 22.x 需加 `--experimental-strip-types`。

速度公式为 `踏频 × (牙盘齿数 / 飞轮齿数) × 轮周(米) × 60 / 1000`。轮周使用 ETRTO 胎圈座直径和名义胎宽估算，并非实测滚动周长。此模型计算给定踏频下的档位对应速度，不预测骑手可达到的极速或套件兼容性。

核心参数与计算在 `lib/drivetrain.ts`，页面在 `app/page.tsx`，样式在 `app/globals.css`。托管元数据在 `.openai/hosting.json`。

本项目是纯前端静态站点：`npm run build` 在 `next.config.ts` 的 `output: 'export'` 模式下生成静态产物，可直接部署到 GitHub Pages 等静态托管。

线上地址：https://osakiyuta.github.io/bike/ （由 GitHub Actions 自动构建部署；注意 vinext 会把 basePath 目录嵌套进导出产物，工作流以 `dist/client/bike` 作为站点根目录。）

## 车架模型

STR 使用常规车架 Stack / Reach，而非厂商 effective 手位坐标。示例分类不是行业阈值，不会由 STR 推导人体舒适度分数。紫色手位点采用页面明确列出的简化把组模型，并非装车或 fitting 建议。参考资料链接随页面提供。
