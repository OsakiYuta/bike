'use client';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { frameGeometry } from './frame';
type State = { stack: number; reach: number; spacers: number; stem: number };
type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
export function useFrameTools(state: State, apply: (next: State) => void) {
  const latest = useRef({ state, apply });
  latest.current = { state, apply };
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const read = () => { const s = latest.current.state; return { ...s, ...frameGeometry(s.stack, s.reach, s.spacers, s.stem) }; };
    const bounds = { stack: [480, 660], reach: [340, 450], spacers: [0, 40], stem: [70, 130] };
    const tools: Tool[] = [
      { name: 'read_frame_geometry', title: '读取车架尺寸与 STR', description: '读取可见的车架几何、STR 和简化手位坐标。', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: read },
      { name: 'configure_frame_geometry', title: '调整车架实验参数', description: '更新车架页的 Stack、Reach、垫圈和把立长度，返回相同界面状态和计算结果。所有尺寸单位为毫米；只修改本页演示。', inputSchema: { type: 'object', properties: Object.fromEntries(Object.entries(bounds).map(([key, [min, max]]) => [key, { type: 'integer', minimum: min, maximum: max }])), required: Object.keys(bounds), additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: input => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('需要完整的车架参数对象');
        const value = input as State;
        if (Object.keys(value).some(key => !(key in bounds))) throw new Error('未知参数');
        for (const [key, [min, max]] of Object.entries(bounds)) { const v = value[key as keyof State]; if (!Number.isInteger(v) || v < min || v > max) throw new Error(`${key} 超出演示范围`); }
        flushSync(() => latest.current.apply(value)); return read();
      } },
    ];
    for (const tool of tools) { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser capability. */ } }
    return () => lifecycle.abort();
  }, []);
}
