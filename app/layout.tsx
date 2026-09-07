import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '骑行原理 · 自行车传动实验室',
  description: '调整牙盘、飞轮、车轮与踏频，用互动传动动画比较公路车、山地车和折叠车的理论速度。',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
