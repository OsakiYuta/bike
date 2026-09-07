import type { Metadata } from 'next';
import FrameLab from '@/components/frame-lab';
export const metadata: Metadata = { title: '车架实验室 · Bison Bike Lab', description: '交互理解 Stack、Reach 与 STR，比较车架几何和把位，认识舒适度、尺码与选车的关系。' };
export default function Page() { return <FrameLab/>; }
