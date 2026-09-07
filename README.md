# 自行车传动实验室

一个面向骑行新手的中文交互页面，演示牙盘、飞轮、轮周和踏频如何影响理论速度。

- 五种牙盘、五种飞轮组、五种带明确轮胎规格的车轮。
- 逐片选择飞轮齿数、0–140 rpm 踏频、公路/山地/折叠示例预设。
- 传动动画、暂停和单圈慢速演示、同踏频车型对比。
- 尺寸来源、计算假设以及风阻、滚阻和骑手功率的解释。
- 手机布局、键盘选择、减少动态效果偏好；可用浏览器中的 WebMCP 读写演示配置。

## 本地运行

使用 Node.js 22.13 或更新版本安装依赖，然后运行：

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```

打开 http://localhost:3000/ 。

## 验证

```powershell
npm run build
npx tsc --noEmit
node --test tests/drivetrain.test.ts
```

测试直接运行 TypeScript，需 Node.js 22.18+；较早的 22.x 需加 `--experimental-strip-types`。

速度公式为 `踏频 × (牙盘齿数 / 飞轮齿数) × 轮周(米) × 60 / 1000`。轮周使用 ETRTO 胎圈座直径和名义胎宽估算，并非实测滚动周长。此模型计算给定踏频下的档位对应速度，不预测骑手可达到的极速或套件兼容性。

核心参数与计算在 `lib/drivetrain.ts`，页面在 `app/page.tsx`，样式在 `app/globals.css`。托管元数据在 `.openai/hosting.json`。

验证记录：构建与类型检查通过；计算测试覆盖全部提供的齿数组合、零踏频和轮径比较。通过浏览器 WebMCP 核验有效配置、无效齿数拒绝及状态保持；未进行截图或全套浏览器点击回归。
