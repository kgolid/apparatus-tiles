import { shuffle, get_random, is_integer } from '../utils';
import { dot, v_half_dot, h_half_dot } from '../tiles/dot';

const requirement_dots_random = (w, h, sc) =>
  is_integer(w) && is_integer(h) && (w === 1 || h === 1);
const display_dots_random = function(p, x0, y0, w, h, scale, cols) {
  const shuffled = shuffle(cols);
  const bg_col = shuffled[0];
  const selected_cols = shuffled.slice(1);

  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const col = get_random(selected_cols);
      dot(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [bg_col, col]);
    }
  }
};

const requirement_v_half_dots_random = (w, h, sc) => is_integer(h) && w === 1 && sc != 1;
const display_v_half_dots_random = function(p, x0, y0, w, h, scale, cols) {
  const shuffled = cols.length < 3 ? shuffle(cols.concat(cols)) : shuffle(cols);
  const bg_cols = shuffled.slice(0, 2);
  const selected_cols = shuffled.slice(2);

  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const col = get_random(selected_cols);
      v_half_dot(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [...bg_cols, col]);
    }
  }
};

const requirement_h_half_dots_random = (w, h, sc) => is_integer(w) && h === 1 && sc != 1;
const display_h_half_dots_random = function(p, x0, y0, w, h, scale, cols) {
  const shuffled = cols.length < 3 ? shuffle(cols.concat(cols)) : shuffle(cols);
  if (shuffled.length < 3) shuffled = shuffled.concat(shuffled);
  const bg_cols = shuffled.slice(0, 2);
  const selected_cols = shuffled.slice(2);

  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const col = get_random(selected_cols);
      h_half_dot(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [...bg_cols, col]);
    }
  }
};

export default [
  [requirement_dots_random, display_dots_random],
  [requirement_h_half_dots_random, display_h_half_dots_random],
  [requirement_v_half_dots_random, display_v_half_dots_random]
];
