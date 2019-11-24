export function solid(p, x, y, ux, uy, cols) {
  p.fill(cols[0]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x + ux[0] + uy[0], y);
  p.vertex(x + ux[0] + uy[0], y + ux[1] + uy[1]);
  p.vertex(x, y + ux[1] + uy[1]);
  p.endShape(p.CLOSE);
}

export function vertical_half(p, x, y, ux, uy, cols) {
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

export function horizontal_half(p, x, y, ux, uy, cols) {
  p.fill(cols[0]);
  solid(p, x, y, ux, uy, cols);
  p.fill(cols[1]);
  p.beginShape();
  p.vertex(x, y);
  p.vertex(x + ux[0] + uy[0], y);
  p.vertex(x + ux[0] + uy[0], y + (ux[1] + uy[1]) / 2);
  p.vertex(x, y + (ux[1] + uy[1]) / 2);
  p.endShape(p.CLOSE);
}
