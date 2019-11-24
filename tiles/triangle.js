import { solid } from './solid';

export function diamond(p, x, y, ux, uy, cols) {
  p.fill(cols[0]);
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x + (ux[0] + uy[0]) / 2, y);
  p.vertex(x + (ux[0] + uy[0]) / 2, y + ux[1] + uy[1]);
  p.vertex(x, y + ux[1] + uy[1]);
  p.endShape(p.CLOSE);
}

export function asc_diagonal(p, x, y, ux, uy, cols) {
  p.fill(cols[0]);
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x + (ux[0] + uy[0]), y);
  p.vertex(x, y + ux[1] + uy[1]);
  p.endShape(p.CLOSE);
}

export function desc_diagonal(p, x, y, ux, uy, cols) {
  const ny = y + uy[1];
  const nx = x + uy[0];
  asc_diagonal(p, nx, ny, ux, [-uy[0], -uy[1]], cols);
}
