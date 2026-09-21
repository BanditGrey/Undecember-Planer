import { authority, runeBySlug, runestoneBySlug, uniques } from '../data';
import { estimateAll } from './dps';
import { analyzeBoard, cells, COLOR_HEX, GRADE_HEX, hexPos, runeColor } from './rules';
import type { Build } from '../types';

const loadImg = (src: string) => new Promise<HTMLImageElement | null>(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); }

/** Renders a shareable PNG card (1200×675, Discord/Twitter friendly) of the build. Returns a data URL. */
export async function renderBuildCard(b: Build, opts: { lang: 'pt' | 'en'; weaponAvg?: number; url?: string }): Promise<string> {
  const W = 1200, H = 675; const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d')!;
  const L = opts.lang === 'pt' ? { equip: 'Equipamento', dps: 'DPS estimado', links: 'vínculos', rm: 'Mestre de Runas', pts: 'pts', by: 'por' } : { equip: 'Equipment', dps: 'Estimated DPS', links: 'links', rm: 'Rune Master', pts: 'pts', by: 'by' };
  // background
  const grd = ctx.createLinearGradient(0, 0, W, H); grd.addColorStop(0, '#1a1510'); grd.addColorStop(1, '#0c0a08'); ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 3; ctx.strokeRect(8, 8, W - 16, H - 16);
  // title
  ctx.fillStyle = '#e8d9a8'; ctx.font = 'bold 34px Georgia, serif'; ctx.fillText(b.name || 'UNDECEMBER build', 36, 60);
  ctx.fillStyle = '#9a917a'; ctx.font = '18px Georgia, serif'; ctx.fillText(`${b.stat}${b.author ? ` · ${L.by} ${b.author}` : ''}${b.char ? ` · Lv ${b.char.level}` : ''}`, 36, 88);
  // board
  const HEX = 34, cx = 300, cy = 370; const { groups, triggers } = analyzeBoard(b);
  const okCells = new Set(groups.flatMap(g => g.links.filter(l => l.check.ok).map(l => l.cell))); const badCells = new Set(groups.flatMap(g => g.links.filter(l => !l.check.ok).map(l => l.cell)));
  ctx.lineWidth = 3; for (const g of groups) for (const l of g.links) { const a = hexPos(g.cell), d = hexPos(l.cell); ctx.strokeStyle = l.check.ok ? '#c9a24a' : '#e05252'; ctx.beginPath(); ctx.moveTo(cx + a.x * HEX, cy + a.y * HEX); ctx.lineTo(cx + d.x * HEX, cy + d.y * HEX); ctx.stroke(); }
  for (const t of triggers) for (const e of [t.target, t.activation]) if (e) { const a = hexPos(t.cell), d = hexPos(e.cell); ctx.strokeStyle = e.ok ? '#7bd1e6' : '#e05252'; ctx.beginPath(); ctx.moveTo(cx + a.x * HEX, cy + a.y * HEX); ctx.lineTo(cx + d.x * HEX, cy + d.y * HEX); ctx.stroke(); }
  const imgs = new Map<string, HTMLImageElement | null>();
  for (const k of cells) { const cell = b.board[k]; const r = cell?.rune ? runeBySlug.get(cell.rune) : undefined; if (r && !imgs.has(r.icons[0])) imgs.set(r.icons[0], await loadImg(r.icons[0])); const s = cell?.runestone ? runestoneBySlug.get(cell.runestone) : undefined; if (s && !imgs.has(s.icon)) imgs.set(s.icon, await loadImg(s.icon)); }
  for (const k of cells) {
    const p = hexPos(k); const x = cx + p.x * HEX, y = cy + p.y * HEX; const cell = b.board[k] || {}; const r = cell.rune ? runeBySlug.get(cell.rune) : undefined;
    hexPath(ctx, x, y, HEX - 1); ctx.fillStyle = r ? '#1e1912' : '#14110d'; ctx.fill();
    ctx.lineWidth = r ? 3 : 1; ctx.strokeStyle = r ? (badCells.has(k) ? '#e05252' : okCells.has(k) ? '#c9a24a' : runeColor(r)) : '#2e2820'; ctx.stroke();
    if (r) { const im = imgs.get(r.icons[0]); if (im) { ctx.save(); hexPath(ctx, x, y, HEX - 5); ctx.clip(); ctx.drawImage(im, x - HEX * 0.72, y - HEX * 0.72, HEX * 1.44, HEX * 1.44); ctx.restore(); }
      if (r.color) { ctx.fillStyle = COLOR_HEX[r.color]; ctx.beginPath(); ctx.arc(x - HEX * 0.55, y + HEX * 0.5, 5, 0, 7); ctx.fill(); }
      if (cell.grade) { ctx.fillStyle = GRADE_HEX[cell.grade]; ctx.font = 'bold 11px sans-serif'; ctx.fillText(['', 'M', 'R', 'L'][cell.grade], x + HEX * 0.4, y - HEX * 0.45); }
      if (r.type === 'Skill' && cell.slots) cell.slots.forEach((sc, d) => { if (!sc) return; const ang = [0, -60, -120, 180, 120, 60][d] * Math.PI / 180; ctx.fillStyle = COLOR_HEX[sc]; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * HEX * 0.82, y + Math.sin(ang) * HEX * 0.82, 4, 0, 7); ctx.fill(); });
      const s = cell.runestone ? runestoneBySlug.get(cell.runestone) : undefined; const si = s && imgs.get(s.icon); if (si) ctx.drawImage(si, x + HEX * 0.15, y + HEX * 0.15, HEX * 0.6, HEX * 0.6); }
  }
  // right column: skills + dps
  let y = 130; const x0 = 590; ctx.font = 'bold 20px Georgia, serif'; ctx.fillStyle = '#c9a24a'; ctx.fillText(L.dps, x0, y); y += 14;
  const dps = estimateAll(b, { weaponAvg: opts.weaponAvg ?? 300, charIncPct: 0 });
  for (const g of groups.slice(0, 6)) { y += 34; const im = imgs.get(g.skill.icons[0]); if (im) ctx.drawImage(im, x0, y - 24, 28, 28); ctx.fillStyle = runeColor(g.skill); ctx.font = 'bold 18px Georgia, serif'; ctx.fillText(g.skill.name, x0 + 36, y - 4);
    const d = dps.find(r => r.skill.slug === g.skill.slug); ctx.fillStyle = '#9a917a'; ctx.font = '14px sans-serif'; const ok = g.links.filter(l => l.check.ok).length; ctx.fillText(`${ok}/${g.links.length} ${L.links}${d ? ` · ${Math.round(d.damage).toLocaleString()}` : ''}`, x0 + 36 + ctx.measureText(g.skill.name).width * 1.35 + 12, y - 4); }
  // equipment
  y += 40; ctx.font = 'bold 20px Georgia, serif'; ctx.fillStyle = '#c9a24a'; ctx.fillText(L.equip, x0, y); y += 6;
  const eq = Object.entries(b.equipment).filter(([, e]) => e?.unique || e?.authority).slice(0, 11);
  ctx.font = '14px sans-serif'; for (const [slot, e] of eq) { y += 22; const u = e?.unique && uniques.find(x => x.slug === e.unique); const a = e?.authority && authority.find(x => x.slug === e.authority); ctx.fillStyle = '#9a917a'; ctx.fillText(slot, x0, y); ctx.fillStyle = '#e2562f'; ctx.fillText(u ? u.name : '', x0 + 90, y); ctx.fillStyle = '#c9a24a'; if (a) ctx.fillText(`⚜ ${a.god}`, x0 + 90 + (u ? ctx.measureText(u.name).width + 12 : 0), y); }
  const rmPts = Object.values(b.runemaster).reduce((s, v) => s + v, 0); if (rmPts) { y += 30; ctx.fillStyle = '#9a917a'; ctx.fillText(`${L.rm}: ${rmPts} ${L.pts}`, x0, y); }
  // footer
  ctx.fillStyle = '#6d6553'; ctx.font = '13px sans-serif'; ctx.fillText(opts.url ?? location.origin + location.pathname, 36, H - 24); ctx.textAlign = 'right'; ctx.fillText('UNDECEMBER Build Planner', W - 36, H - 24); ctx.textAlign = 'left';
  return c.toDataURL('image/png');
}
