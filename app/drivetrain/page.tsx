import type { Metadata } from 'next';
import DrivetrainLab from '@/components/drivetrain-lab';
export const metadata: Metadata = { title: '传动实验室 · Bison Bike Lab', description: '调整牙盘、飞轮、轮径和踏频，理解齿比如何影响自行车的理论速度。' };
export default function Page() { return <DrivetrainLab/>; }
