import type { Metadata } from 'next';
import './globals.css';
import './labs.css';
import { SiteHeader, SiteFooter } from '@/components/site/site-shell';
export const metadata: Metadata = {
  title: "拜松的单车实验室 · Bison Bike Lab",
  description: '在拜松的单车实验室，动手理解自行车传动、车架几何与 STR，让每一次选车都有依据。',
  icons: { icon: [{ url: '/bison-logo.png?v=2', type: 'image/png' }] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><SiteHeader/>{children}<SiteFooter/></body></html>;
}
