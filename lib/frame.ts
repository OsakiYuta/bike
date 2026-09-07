export const FRAME_PRESETS = [
  { id: 'race', label: '偏竞技', stack: 540, reach: 390, note: '前端较低，车身较长' },
  { id: 'balanced', label: '均衡参考', stack: 570, reach: 385, note: '本页的对比基准' },
  { id: 'endurance', label: '偏耐力', stack: 610, reach: 375, note: '前端较高，车身较短' },
];
export const FRAME_REFERENCE = { stack: 570, reach: 385 };
export function frameGeometry(stack: number, reach: number, spacers = 20, stem = 100) {
  if (!Number.isFinite(stack) || !Number.isFinite(reach) || stack <= 0 || reach <= 0) throw new Error('Stack 和 Reach 必须为正数');
  const headAngle = 73 * Math.PI / 180, stemAngle = 6 * Math.PI / 180;
  return { str: stack / reach, stackDelta: stack - FRAME_REFERENCE.stack, reachDelta: reach - FRAME_REFERENCE.reach,
    handStack: stack + spacers * Math.sin(headAngle) + stem * Math.sin(stemAngle),
    handReach: reach - spacers * Math.cos(headAngle) + stem * Math.cos(stemAngle) + 75 };
}
