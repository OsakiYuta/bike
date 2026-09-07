import Link from 'next/link';
import { ArrowUpRight, Repeat2, Ruler } from 'lucide-react';
import './home.css';

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-backdrop" aria-hidden="true">
          <img src="/bike/bison-cycling-transparent.png" alt="" width={1920} height={1440} fetchPriority="high" />
        </div>
        <div className="home-content">
          <div className="home-heading">
            <div className="eyebrow"><span /> BISON BIKE LAB</div>
            <h1 id="home-title">先弄懂单车，<br /><span>再去享受骑行。</span></h1>
            <p>速度为什么不同？骑起来为什么累？<br />动手调一调，让骑行原理变得直观。</p>
          </div>
          <div className="home-experiments" aria-label="选择实验室">
            <Link href="/drivetrain" className="experiment-entry entry-drivetrain">
              <div className="entry-label"><span>实验室 01 / DRIVETRAIN</span><Repeat2 size={19} aria-hidden="true" /></div>
              <div className="entry-title"><h2>传动实验室</h2><ArrowUpRight size={24} aria-hidden="true" /></div>
              <p>换牙盘、拨飞轮，看看一圈脚踏能走多远。</p>
              <div className="entry-topics">齿比 <span>·</span> 轮径 <span>·</span> 速度</div>
            </Link>
            <Link href="/frame" className="experiment-entry entry-frame">
              <div className="entry-label"><span>实验室 02 / FRAME GEOMETRY</span><Ruler size={19} aria-hidden="true" /></div>
              <div className="entry-title"><h2>车架实验室</h2><ArrowUpRight size={24} aria-hidden="true" /></div>
              <p>调整 Stack 与 Reach，看懂车架与骑姿的关系。</p>
              <div className="entry-topics">STR <span>·</span> 骑姿 <span>·</span> 舒适度</div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
