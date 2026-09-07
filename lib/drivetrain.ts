export const CHAINRINGS = [32, 40, 45, 50, 52];
export const CASSETTES = [
  { id: '11-28', label: '11–28T', cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 28] },
  { id: '11-34', label: '11–34T', cogs: [11, 13, 15, 17, 19, 21, 23, 26, 30, 34] },
  { id: '11-42', label: '11–42T', cogs: [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 42] },
  { id: '11-50', label: '11–50T', cogs: [11, 13, 15, 17, 19, 22, 25, 28, 32, 36, 42, 50] },
  { id: '10-51', label: '10–51T', cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51] },
];
export const WHEELS = [
  { id: '700c', label: '700C', short: '公路', tire: '700 × 28C', etrto: '28-622', bsd: 622, width: 28 },
  { id: '29', label: '29″', short: '山地', tire: '29 × 2.25″', etrto: '57-622', bsd: 622, width: 57 },
  { id: '27.5', label: '27.5″', short: '山地', tire: '27.5 × 2.25″', etrto: '57-584', bsd: 584, width: 57 },
  { id: '451', label: '451', short: '折叠', tire: '20 × 1⅛″', etrto: '28-451', bsd: 451, width: 28 },
  { id: '406', label: '406', short: '折叠', tire: '20 × 1.50″', etrto: '40-406', bsd: 406, width: 40 },
];
export const PRESETS = [
  { id: 'road', name: '公路车', front: 50, cassette: '11-34', wheel: '700c' },
  { id: 'mtb', name: '山地车', front: 32, cassette: '11-50', wheel: '29' },
  { id: 'folding', name: '折叠车', front: 52, cassette: '11-28', wheel: '451' },
];
export function calculate(front: number, rear: number, wheel: { bsd: number; width: number }, cadence: number) {
  const circumference = Math.PI * (wheel.bsd + 2 * wheel.width) / 1000;
  const ratio = front / rear;
  const development = circumference * ratio;
  return { circumference, ratio, development, speed: development * cadence * 60 / 1000, wheelRpm: cadence * ratio };
}
