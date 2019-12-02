import { solid, vertical_half, horizontal_half } from './solid';

export function square(p, x, y, ux, uy, cols, pad) {
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x + pad, y + pad);
  p.vertex(x + (ux[0] + uy[0]) - pad, y + pad);
  p.vertex(x + (ux[0] + uy[0]) - pad, y + (ux[1] + uy[1]) - pad);
  p.vertex(x + pad, y + (ux[1] + uy[1]) - pad);
  p.endShape(p.CLOSE);
}
