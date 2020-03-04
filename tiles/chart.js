import { solid } from './solid';

export function pie(p, x, y, ux, uy, cols, r0, r1) {
  solid(p, x, y, ux, uy, cols);
  const cx = (ux[0] + uy[0]) / 2;
  const cy = (ux[1] + uy[1]) / 2;

  p.fill(cols[1]);
  if (r0 === r1) {
    p.ellipse(x + cx, y + cy, cx * 1.5, cy * 1.5);
  } else {
    p.arc(x + cx, y + cy, cx * 1.5, cy * 1.5, r0, r1, p.PIE);
    p.fill(cols[2]);
    p.arc(x + cx, y + cy, cx * 1.5, cy * 1.5, r1, r0, p.PIE);
  }
}

export function bar(p, x, y, ux, uy, cols, rx0, rx1) {
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x + rx0, y);
  p.vertex(x + rx0, y + (ux[1] + uy[1]));
  p.vertex(x, y + (ux[1] + uy[1]));
  p.endShape(p.CLOSE);
  p.fill(cols[2]);
  p.beginShape();
  p.vertex(x + rx0, y);
  p.vertex(x + rx1, y);
  p.vertex(x + rx1, y + (ux[1] + uy[1]));
  p.vertex(x + rx0, y + (ux[1] + uy[1]));
  p.endShape(p.CLOSE);
}

export function column(p, x, y, ux, uy, cols, r0, r1) {
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x, y + r0);
  p.vertex(x + (ux[0] + uy[0]), y + r0);
  p.vertex(x + (ux[0] + uy[0]), y);
  p.endShape(p.CLOSE);
  p.fill(cols[2]);
  p.beginShape();
  p.vertex(x, y + r0);
  p.vertex(x, y + r1);
  p.vertex(x + (ux[0] + uy[0]), y + r1);
  p.vertex(x + (ux[0] + uy[0]), y + r0);
  p.endShape(p.CLOSE);
}
