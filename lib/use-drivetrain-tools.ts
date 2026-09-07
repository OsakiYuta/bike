'use client';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { CASSETTES, CHAINRINGS, WHEELS, calculate } from './drivetrain';

type Configuration = { front: number; cassette: string; wheel: string; rear: number; cadence: number };
type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
type ModelContext = { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> };

function validate(input: unknown): Configuration {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('参数必须为对象。');
  const data = input as Configuration;
  if (Object.keys(data).some(key => !['front', 'cassette', 'wheel', 'rear', 'cadence'].includes(key))) throw new Error('存在未知参数。');
  const cassette = CASSETTES.find(c => c.id === data.cassette);
  if (!CHAINRINGS.includes(data.front) || !cassette || !WHEELS.some(w => w.id === data.wheel)) throw new Error('请选择页面支持的牙盘、飞轮组和车轮。');
  if (!cassette.cogs.includes(data.rear)) throw new Error('所选飞轮组不包含该齿数。');
  if (!Number.isInteger(data.cadence) || data.cadence < 0 || data.cadence > 140) throw new Error('踏频须为 0–140 的整数。');
  return data;
}

export function useDrivetrainTools(state: Configuration, apply: (next: Configuration) => void) {
  const latest = useRef({ state, apply });
  latest.current = { state, apply };
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const read = () => {
      const s = latest.current.state;
      return { ...s, ...calculate(s.front, s.rear, WHEELS.find(w => w.id === s.wheel)!, s.cadence) };
    };
    const tools: Tool[] = [
      { name: 'read_drivetrain', title: '读取传动配置与速度', description: '读取当前可见的牙盘、飞轮、车轮、踏频以及理论速度。', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: read },
      { name: 'configure_drivetrain', title: '调整自行车传动配置', description: '设置当前页面的牙盘、飞轮组、当前飞轮齿数、车轮与踏频，并返回更新后的理论速度。仅修改本页演示。', inputSchema: { type: 'object', properties: { front: { type: 'integer', enum: CHAINRINGS }, cassette: { type: 'string', enum: CASSETTES.map(c => c.id) }, rear: { type: 'integer', minimum: 10, maximum: 51 }, wheel: { type: 'string', enum: WHEELS.map(w => w.id) }, cadence: { type: 'integer', minimum: 0, maximum: 140 } }, required: ['front', 'cassette', 'rear', 'wheel', 'cadence'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: input => { const next = validate(input); flushSync(() => latest.current.apply(next)); return read(); } },
    ];
    for (const tool of tools) {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Browsers without the proposed API retain all visible controls. */ }
    }
    return () => lifecycle.abort();
  }, []);
}
