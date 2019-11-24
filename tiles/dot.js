import { solid, vertical_half, horizontal_half } from './solid';

export function dot(p, x, y, ux, uy, cols) {
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  const cx = (ux[0] + uy[0]) / 2;
  const cy = (ux[1] + uy[1]) / 2;
  p.ellipse(x + cx, y + cy, cx, cy);
}

export function v_half_dot(p, x, y, ux, uy, cols) {
  vertical_half(p, x, y, ux, uy, cols);
  p.fill(cols[2]);
  const cx = (ux[0] + uy[0]) / 2;
  const cy = (ux[1] + uy[1]) / 2;
  p.ellipse(x + cx, y + cy, cx, cy);
}

export function h_half_dot(p, x, y, ux, uy, cols) {
  horizontal_half(p, x, y, ux, uy, cols);
  p.fill(cols[2]);
  const cx = (ux[0] + uy[0]) / 2;
  const cy = (ux[1] + uy[1]) / 2;
  p.ellipse(x + cx, y + cy, cx, cy);
}
