'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

export function SiteHeader() {
  const path = usePathname();
  return <header className="site-header shared-header"><Link className="brand" href="/" aria-label="拜松的单车实验室首页"><img className="brand-logo" src="/bike/bison-logo.png?v=2" alt="拜松的像素头像" width={54} height={54}/><span className="brand-copy"><strong>拜松的单车实验室</strong><span className="brand-en">Bison Bike Lab</span></span></Link><nav aria-label="实验室导航">{[{ href: '/', label: '实验室首页' }, { href: '/drivetrain', label: '传动实验室' }, { href: '/frame', label: '车架实验室' }].map(item => <Link key={item.href} href={item.href} className={path === item.href ? 'active' : ''} aria-current={path === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav><span className="chapter">动手试试，就懂了 <ArrowUpRight size={14}/></span></header>;
}

export function SiteFooter() {
  return <footer className="shared-footer"><Link className="brand" href="/"><span className="brand-copy"><strong>拜松的单车实验室</strong><span className="brand-en">Bison Bike Lab</span></span></Link><span>每一次好奇，都是骑行的开始。</span></footer>;
}
