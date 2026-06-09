/** Sample a circle's perimeter as a closed polyline (for drawing the hazard). */
export function sampleCircle(
  cx: number,
  cy: number,
  r: number,
  n = 64,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const theta = (2 * Math.PI * i) / n;
    pts.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
  }
  return pts;
}

/** Speed magnitude at each trajectory point. */
export function speeds(trajectory: { vx: number; vy: number }[]): number[] {
  return trajectory.map((p) => Math.hypot(p.vx, p.vy));
}

/** Equal-aspect numeric domain [min,max] padded around a set of points + extras. */
export function squareDomain(
  xs: number[],
  ys: number[],
  pad = 1,
): { x: [number, number]; y: [number, number] } {
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  // round to integers so axis tick labels stay clean (no raw-float bounds)
  const lo = Math.floor(Math.min(minX, minY) - pad);
  const hi = Math.ceil(Math.max(maxX, maxY) + pad);
  return { x: [lo, hi], y: [lo, hi] };
}
