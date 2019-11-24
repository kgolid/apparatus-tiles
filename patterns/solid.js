import { shuffle, get_random_subset, get_random, is_integer } from '../utils';
import { solid } from '../tiles/solid';

const requirement_solid_random = (w, h) => is_integer(w) && is_integer(h);
const display_solid_random = function(p, x0, y0, w, h, scale, cols) {
  const selected_cols = get_random_subset(cols, 2);
  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      solid(p, x0 + xi * scale, y0 + yi * scale, ux, uy, shuffle(selected_cols));
    }
  }
};

const requirement_solid_sequential = (w, h) => is_integer(w) && is_integer(h);
const display_solid_sequential = function(p, x0, y0, w, h, scale, cols) {
  const selected_cols = get_random_subset(cols, 2);
  const ux = [scale, 0];
  const uy = [0, scale];

  let ci = 0;
  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      solid(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [selected_cols[ci]]);
      ci = (ci + 1) % selected_cols.length;
    }
  }
};

export default [
  [requirement_solid_random, display_solid_random],
  [requirement_solid_sequential, display_solid_sequential]
];
