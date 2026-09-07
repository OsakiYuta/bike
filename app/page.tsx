'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Bike, ChevronRight, CircleHelp, Gauge, Mountain, Pause, Play, RotateCcw, Settings2, Wind, Zap } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CHAINRINGS, CASSETTES, WHEELS, PRESETS, calculate } from '@/lib/drivetrain';
import { useDrivetrainTools } from '@/lib/use-drivetrain-tools';

const one = (v: number | readonly number[]) => typeof v === 'number' ? v : v[0];
const fixed = (v: number, places = 1) => v.toFixed(places);

function Choices({ name, value, options, onChange }: { name: string; value: string; options: { value: string; label: string; note?: string }[]; onChange: (v: string) => void }) {
  return <RadioGroup aria-label={name} value={value} onValueChange={v => onChange(String(v))} className="choice-row">
    {options.map(option => <label className={`choice ${value === option.value ? 'selected' : ''}`} key={option.value}>
      <RadioGroupItem value={option.value} aria-label={option.label} className="choice-radio" />
      <span>{option.label}</span>{option.note && <small>{option.note}</small>}
    </label>)}
  </RadioGroup>;
}

function gearPath(teeth: number) {
  const radius = teeth * .96;
  return Array.from({ length: teeth * 4 }, (_, i) => {
    const a = i / (teeth * 4) * Math.PI * 2;
    const r = radius + (i % 4 === 1 || i % 4 === 2 ? 2.3 : -.8);
    return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ') + 'Z';
}

function Drivetrain({ front, rear, wheel, cadence, playing, step, stepping, onStepEnd }: { front: number; rear: number; wheel: typeof WHEELS[number]; cadence: number; playing: boolean; step: number; stepping: boolean; onStepEnd: () => void }) {
  const crankRef = useRef<SVGGElement>(null);
  const wheelRef = useRef<SVGGElement>(null);
  const cogRef = useRef<SVGGElement>(null);
  const chainRef = useRef<SVGPathElement>(null);
  const phases = useRef({ crank: 0, rear: 0, chain: 0 });
  const previousStep = useRef(0);
  const stepRemaining = useRef(0);
  const radius = (wheel.bsd + 2 * wheel.width) / 736 * 147;
  const rf = front * .96, rr = rear * .96, distance = 310;
  const angle = Math.acos((rf - rr) / distance);
  const [rx, ry, fx, fy] = [220 - rr * Math.cos(angle), 222 - rr * Math.sin(angle), 530 - rf * Math.cos(angle), 222 - rf * Math.sin(angle)].map(n => Number(n.toFixed(3)));
  const chain = `M${rx},${ry} L${fx},${fy} A${rf},${rf} 0 1 1 ${fx},${444 - fy} L${rx},${444 - ry} A${rr},${rr} 0 0 1 ${rx},${ry}`;
  useEffect(() => {
    let frame = 0, last = 0;
    if (step !== previousStep.current) stepRemaining.current = 1;
    if (!stepping) stepRemaining.current = 0;
    previousStep.current = step;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, .06);
      last = now;
      const delta = stepRemaining.current > 0 ? Math.min(dt / 1.8, stepRemaining.current) : playing ? cadence / 60 * dt : 0;
      const p = phases.current;
      p.crank += delta; p.rear += delta * front / rear; p.chain += delta * 2 * Math.PI * rf;
      crankRef.current?.setAttribute('transform', `rotate(${p.crank * 360})`);
      wheelRef.current?.setAttribute('transform', `rotate(${p.rear * 360})`);
      cogRef.current?.setAttribute('transform', `rotate(${p.rear * 360})`);
      chainRef.current?.setAttribute('stroke-dashoffset', String(-p.chain));
      if (stepRemaining.current > 0) { stepRemaining.current -= delta; if (stepRemaining.current <= 0) onStepEnd(); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [front, rear, cadence, playing, step, stepping, rf, onStepEnd]);

  return <svg className="mechanism" viewBox="0 0 750 410" role="img" aria-label={`${front} 齿牙盘驱动 ${rear} 齿飞轮，脚踏一圈后轮旋转 ${(front / rear).toFixed(2)} 圈。`}>
    <defs>
      <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#657281" opacity=".25" /></pattern>
      <radialGradient id="wheel-glow"><stop stopColor="#667b90" stopOpacity=".09"/><stop offset="1" stopColor="#667b90" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="750" height="410" fill="url(#grid)"/>
    <circle cx="220" cy="222" r="180" fill="url(#wheel-glow)"/>
    <path d="M30 372H716" stroke="#36424e" strokeDasharray="4 7"/>
    <g transform="translate(220 222)">
      <circle r={radius} fill="none" stroke="#73808c" strokeWidth="9"/>
      <circle r={radius - 7} fill="none" stroke="#354654" strokeWidth="2"/>
      <g ref={wheelRef}>
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1="0" y1="0" x2={(Math.cos(i * Math.PI / 10) * (radius - 8)).toFixed(3)} y2={(Math.sin(i * Math.PI / 10) * (radius - 8)).toFixed(3)} stroke="#627381" strokeWidth="1" opacity=".6"/>)}
        <path d={`M0,${-radius} A${radius},${radius} 0 0 1 ${radius * .5},${-radius * .866}`} fill="none" stroke="#faf5ec" strokeWidth="8" />
        <circle cy={-radius} r="5" fill="#ff754b" />
      </g>
      {[.85, .72, .6].map(n => <circle key={n} r={49 * n} fill="none" stroke="#53616d" strokeWidth="1.5" opacity=".45"/>)}
      <g ref={cogRef}><path d={gearPath(rear)} fill="#2b3640" stroke="#ffad77" strokeWidth="1.5"/><path d={`M0,-${rr*.6}V${rr*.6} M-${rr*.6},0H${rr*.6}`} stroke="#b28769" strokeWidth="3"/></g>
      <circle r="6" fill="#b5c2cb"/><circle r="2" fill="#1c2630"/>
    </g>
    <g transform="translate(530 222)">
      <g ref={crankRef}>
        <path d={gearPath(front)} fill="#3b312d" stroke="#ff9e69" strokeWidth="1.5"/>
        <circle r={rf * .76} fill="#1d2832" stroke="#cc734e" strokeWidth="1"/>
        {[0,72,144,216,288].map(a => <path key={a} transform={`rotate(${a})`} d={`M-5,0 L-9,-${rf*.69} L9,-${rf*.69} L5,0Z`} fill="#b88364" />)}
        <line x1="0" y1="0" x2="48" y2="54" stroke="#dce5e8" strokeWidth="9" strokeLinecap="round"/>
        <line x1="36" y1="54" x2="62" y2="54" stroke="#e6eef1" strokeWidth="7" strokeLinecap="round"/>
        <circle r="9" fill="#242c34" stroke="#dce5e8" strokeWidth="3"/>
        <circle cy={-rf * .88} r="3.5" fill="#fff3ce"/>
      </g>
    </g>
    <path d={chain} fill="none" stroke="#b5784f" strokeWidth="5"/>
    <path ref={chainRef} d={chain} fill="none" stroke="#ffe0b3" strokeWidth="3" strokeDasharray="4 4"/>
    <path d="M530 126V74H626 M220 222L98 151H45 M332 302L412 334H454" fill="none" stroke="#748391" strokeWidth="1"/>
    <text x="536" y="60" className="svg-label">牙盘 · {front}T</text><text x="536" y="93" className="svg-small">脚踏带它转动</text>
    <text x="43" y="126" className="svg-label">飞轮 · {rear}T</text>
    <text x="460" y="339" className="svg-small">链条把转动传给后轮</text>
    <text x="220" y="403" textAnchor="middle" className="svg-small">后轮 · {wheel.label} · 轮胎 {wheel.etrto}</text>
    <text x="360" y="204" textAnchor="middle" fill="#ffb17d" fontSize="18">→</text>
  </svg>;
}

export default function Home() {
  const [front, setFront] = useState(50);
  const [cassetteId, setCassetteId] = useState('11-34');
  const [wheelId, setWheelId] = useState('700c');
  const [gear, setGear] = useState(0);
  const [cadence, setCadence] = useState(90);
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [stepping, setStepping] = useState(false);
  const [preset, setPreset] = useState('road');
  const cassette = CASSETTES.find(c => c.id === cassetteId)!;
  const wheel = WHEELS.find(w => w.id === wheelId)!;
  const rear = cassette.cogs[Math.min(gear, cassette.cogs.length - 1)];
  const result = calculate(front, rear, wheel, cadence);
  const top = calculate(front, cassette.cogs[0], wheel, cadence);
  const low = calculate(front, cassette.cogs[cassette.cogs.length - 1], wheel, cadence);
  const custom = () => { setPreset('custom'); setStepping(false); };
  const applyPreset = (id: string) => {
    const p = PRESETS.find(p => p.id === id)!;
    setFront(p.front); setCassetteId(p.cassette); setWheelId(p.wheel); setGear(0); setPreset(id); setStepping(false);
  };
  const stepEnd = useRef(() => setStepping(false)).current;
  const comparisons = PRESETS.map(p => ({ ...p, speed: calculate(p.front, CASSETTES.find(c => c.id === p.cassette)!.cogs[0], WHEELS.find(w => w.id === p.wheel)!, cadence).speed }));
  const chartMax = Math.max(...comparisons.map(p => p.speed), top.speed, 1) * 1.12;
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false); }, []);
  useDrivetrainTools({ front, cassette: cassetteId, wheel: wheelId, rear, cadence }, next => {
    setFront(next.front); setCassetteId(next.cassette); setWheelId(next.wheel); setCadence(next.cadence);
    setGear(CASSETTES.find(c => c.id === next.cassette)!.cogs.indexOf(next.rear)); setStepping(false);
    setPreset(PRESETS.find(p => p.front === next.front && p.cassette === next.cassette && p.wheel === next.wheel)?.id ?? 'custom');
  });

  return <>
    <header className="site-header"><a className="brand" href="#"><span className="brand-icon"><Bike size={25}/></span><strong>骑行原理</strong><span className="brand-en">CYCLE LAB</span></a><nav aria-label="页面导航"><a href="#lab" className="active">传动实验室</a><a href="#compare">车型对比</a><a href="#principles">速度的秘密 <ArrowRight size={14}/></a></nav><span className="chapter">骑行入门 <span>01 / 传动</span></span></header>
    <main>
      <section className="intro" id="lab"><div><div className="eyebrow"><span/> 从一圈脚踏开始理解自行车</div><h1>同样的踏频，<span>能骑多快？</span></h1><p>换个牙盘、拨一下飞轮，看看你的每一次踩踏，能带你走多远。</p></div><a className="intro-link" href="#principles">第一次接触齿比？<br/><span>往下看看原理 <ArrowDown size={15}/></span></a></section>
      <div className="lab-grid">
        <section className="simulation" aria-label="传动动画和速度结果">
          <div className="sim-top"><div><span className={`live-dot ${playing || stepping ? '' : 'paused'}`}/>{stepping ? '正在演示一圈' : playing ? '传动进行中' : '动画已暂停'}</div><span>侧面示意 · 后轮与脚踏</span></div>
          <div className="speed-row"><div><div className="speed-label">当前档位 · 理论速度</div><div className="speed-value"><output aria-live="polite">{fixed(result.speed)}</output><span>km/h</span></div></div><div className="speed-context"><span>{front}T <span>/</span> {rear}T</span><small>{cadence} rpm · {wheel.label}</small><span className="gear-badge">{gear === 0 ? '当前已是最快档' : gear === cassette.cogs.length - 1 ? '当前最省力档' : `第 ${cassette.cogs.length - gear} 档 / ${cassette.cogs.length} 档`}</span></div></div>
          <Drivetrain front={front} rear={rear} wheel={wheel} cadence={cadence} playing={playing} step={step} stepping={stepping} onStepEnd={stepEnd}/>
          <div className="animation-controls"><span><i className="legend crank"/>牙盘转 1 圈 <ArrowRight size={15}/> <i className="legend wheel"/>后轮转 <b>{fixed(result.ratio, 2)}</b> 圈</span><div><button className="icon-btn" aria-label={playing ? '暂停动画' : '播放动画'} onClick={() => { setPlaying(!playing); setStepping(false); }} disabled={stepping}>{playing ? <Pause size={16}/> : <Play size={16}/>}</button><button className="step-btn" disabled={stepping} onClick={() => { setPlaying(false); setStepping(true); setStep(n => n + 1); }}><RotateCcw size={14}/> 踩一圈</button></div></div>
          <div className="sim-stats"><div><small>齿比 <span>牙盘 ÷ 飞轮</span></small><strong>{fixed(result.ratio, 2)}<span> : 1</span></strong></div><div><small>踩一圈前进</small><strong>{fixed(result.development, 2)}<span> 米</span></strong></div><div><small>这套配置的最快档</small><strong>{fixed(top.speed)}<span> km/h</span></strong></div></div>
        </section>
        <aside className="settings" aria-label="自行车传动参数">
          <div className="settings-title"><h2><Settings2 size={18}/> 配置你的自行车</h2><button onClick={() => { applyPreset('road'); setCadence(90); setPlaying(true); }} className="reset" aria-label="重置为公路车和90转踏频"><RotateCcw size={14}/> 重置</button></div>
          <Choices name="车型预设" value={preset} onChange={applyPreset} options={PRESETS.map(p => ({ value: p.id, label: p.name }))}/>
          <div className="field"><div className="field-heading"><h3><span>01</span> 牙盘</h3><small>T = 齿的数量</small></div><Choices name="牙盘齿数" value={String(front)} onChange={v => { setFront(Number(v)); custom(); }} options={CHAINRINGS.map(n => ({ value: String(n), label: `${n}T` }))}/><p>前面的齿轮。越大，同一圈脚踏带动的链条越多。</p></div>
          <div className="field"><div className="field-heading"><h3><span>02</span> 飞轮组</h3><small>最小齿 — 最大齿</small></div><Choices name="飞轮组范围" value={cassetteId} onChange={v => { setCassetteId(v); setGear(0); custom(); }} options={CASSETTES.map(c => ({ value: c.id, label: c.label }))}/><p>后面的一组齿轮。选好范围，再切换当前档位。</p><div className="gear-control"><div className="gear-heading"><span>当前飞轮</span><strong>{rear}<small>T</small></strong></div><div className="cog-buttons" role="group" aria-label="选择当前飞轮齿数">{[...cassette.cogs].reverse().map((cog, i) => <button key={cog} aria-label={`${cog} 齿飞轮`} aria-pressed={rear === cog} onClick={() => { setGear(cassette.cogs.length - 1 - i); setStepping(false); }} className={rear === cog ? 'chosen' : ''}><span style={{ height: `${10 + cog / cassette.cogs[cassette.cogs.length - 1] * 24}px` }}/><small>{cog}</small></button>)}</div><div className="range-labels"><span>← 爬坡更省力</span><span>平路更快 →</span></div></div></div>
          <div className="field"><div className="field-heading"><h3><span>03</span> 车轮</h3><small>包含示例轮胎</small></div><Choices name="车轮规格" value={wheelId} onChange={v => { setWheelId(v); custom(); }} options={WHEELS.map(w => ({ value: w.id, label: w.label, note: w.short }))}/><p>当前轮周约 <b>{fixed(result.circumference, 3)} 米</b>。{wheel.tire}，ETRTO {wheel.etrto}。</p></div>
          <div className="cadence-field"><div className="field-heading"><h3><Gauge size={17}/> 踏频</h3><strong>{cadence}<small> rpm</small></strong></div><Slider aria-label="每分钟踏频" min={0} max={140} step={1} value={[cadence]} onValueChange={v => setCadence(one(v))}/><div className="range-labels"><span>0</span><button onClick={() => setCadence(90)}>90 舒适参考值</button><span>140</span></div><p>每分钟脚踏转几圈。调整后，三种车型用同一踏频对比。</p></div>
        </aside>
      </div>
      <div className="insight"><span className="insight-icon"><Zap size={18}/></span><p><strong>试一试：</strong>保持 {front}T 牙盘，把飞轮从 {cassette.cogs[0]}T 换到 {cassette.cogs.at(-1)}T。同样踩 {cadence} 转，速度从 <b>{fixed(top.speed)}</b> 降到 <b>{fixed(low.speed)} km/h</b>，但踩踏会更省力。</p><button onClick={() => { setGear(gear === cassette.cogs.length - 1 ? 0 : cassette.cogs.length - 1); setStepping(false); }}>切换{gear === cassette.cogs.length - 1 ? '最快' : '爬坡'}档 <ArrowRight size={16}/></button></div>
      <section className="comparison-section" id="compare"><div className="section-heading"><div><div className="eyebrow">SAME CADENCE, DIFFERENT GEARS</div><h2>同样踩 {cadence} 转，看看差多少</h2></div><span className="section-note">三种示例配置 · 均使用最快档</span></div><div className="comparison-grid"><div className="comparison-chart">{comparisons.map((p, i) => <button key={p.id} className={`comparison-row ${preset === p.id ? 'selected' : ''}`} onClick={() => applyPreset(p.id)} aria-label={`使用${p.name}示例配置`}><span className="comparison-icon">{i === 1 ? <Mountain size={21}/> : <Bike size={23}/>}</span><span className="comparison-info"><strong>{p.name}</strong><small>{p.front} / {CASSETTES.find(c => c.id === p.cassette)!.cogs[0]}T · {WHEELS.find(w => w.id === p.wheel)!.label}</small></span><span className="bar-track"><span className={`bar bar-${i}`} style={{ width: `${p.speed / chartMax * 100}%` }}/></span><span className="comparison-speed">{fixed(p.speed)}<small>km/h</small></span></button>)}<div className="chart-caption">点击一行，把示例配置带回实验室。数值是档位对应速度，不是实测极速。</div></div><div className="takeaway"><span className="mini-label">发现了吗？</span><h3>公路车的大牙盘，<br/>让每一圈走得更远。</h3><p>山地车的小牙盘配大飞轮，优先照顾陡坡上的省力；折叠车则常用大牙盘补偿小轮径。</p><p className="takeaway-foot">29 寸山地轮的外径甚至可以大于 700C 公路轮。车速不能只看轮子大小。</p></div></div></section>
      <section className="principles" id="principles"><div className="section-heading"><div><div className="eyebrow">A LITTLE SCIENCE</div><h2>速度，藏在这三个乘数里</h2></div></div><div className="formula"><div><small>每分钟踩几圈</small><strong>{cadence}<span> rpm</span></strong><label>踏频</label></div><b>×</b><div><small>每踩一圈，后轮转几圈</small><strong>{front} ÷ {rear}</strong><label>齿比</label></div><b>×</b><div><small>后轮每圈走多远</small><strong>{fixed(result.circumference, 3)}<span> m</span></strong><label>轮周</label></div><b>× <span>60 ÷ 1000</span> =</b><div className="formula-result"><small>换算成每小时公里数</small><strong>{fixed(result.speed)}<span> km/h</span></strong><label>理论速度</label></div></div>
        <div className="reality"><div className="reality-title"><CircleHelp size={21}/><h3>挂上高速档，就一定骑得快吗？</h3></div><p>还要有足够的力量，才能在这个档位维持踏频。齿比大只代表同样转速下走得远，不会凭空增加功率。公路车在铺装平路上通常更快，还和下面这些因素有关。</p><div className="reality-factors"><div><Wind size={21}/><strong>更低的风阻</strong><p>更低的骑姿通常迎风面积更小，速度越高，空气阻力越关键。</p></div><div><Gauge size={21}/><strong>更合适的轮胎</strong><p>适合铺装路面的胎面、结构与胎压影响滚阻，并非越窄就必然越快。</p></div><div><Mountain size={21}/><strong>不同的使用场景</strong><p>山地车的齿比、胎纹和避震偏向越野；在陡坡和烂路上有自己的优势。</p></div></div></div>
        <details className="methodology"><summary>轮径、计算假设与参数来源 <ChevronRight size={16}/></summary><div><p>轮周按 π ×（胎圈座直径 + 2 × 轮胎名义宽度）估算，单位由毫米换为米；实际胎高、胎压和载荷会改变滚动周长。可通过轮胎落地滚动一整圈实测校准。</p><p>700C 与 29 寸的胎圈座直径均为 622 mm，27.5 寸为 584 mm，451 与 406 分别为 451 mm、406 mm。传统 27 寸通常为 630 mm，与 27.5 寸不能混用。</p><p>牙盘选项表示当前使用的单片牙盘；飞轮齿序采用代表性示例，不指定整车或套件型号。组合用于理解传动原理，不构成零件兼容性建议。动画为无打滑、持续啮合的几何示意；白色轮圈标记帮助观察旋转，高转速下请用“踩一圈”慢速演示。</p><p>公式不计风阻、滚阻、坡度或骑手输出，因此“最快档速度”只是给定踏频对应的速度，并非整车极速；下坡滑行也可能超过该值。</p><p>尺寸参考：<a href="https://www.schwalbe.com/media/97/93/b4/1700219698/Reifengroessen-uebersicht_EN.pdf" target="_blank" rel="noreferrer">Schwalbe 轮胎尺寸对照</a>；飞轮参考：<a href="https://productinfo.shimano.com/en/product/CS-HG500-10" target="_blank" rel="noreferrer">Shimano 公路飞轮</a>、<a href="https://bike.shimano.com/en-NA/products/components/pdp.P-CS-M5100-11.html" target="_blank" rel="noreferrer">Shimano 山地飞轮</a>。</p></div></details>
      </section>
    </main><footer><a className="brand" href="#"><Bike size={19}/><strong>骑行原理</strong></a><span>把骑行的道理，变成看得见的一圈。</span><a href="#lab">回到实验室 ↑</a></footer>
  </>;
}
