import { shuffle, get_random_subset, is_integer } from '../utils';
import { asc_diagonal, desc_diagonal } from '../tiles/triangle';

const requirement_triangle_random = (w, h) => is_integer(w) && is_integer(h);
const display_triangle_random = function(p, x0, y0, w, h, scale, cols) {
  const selected_cols = get_random_subset(cols, 2);
  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const diagonal = (xi + yi) % 2 === 0 ? asc_diagonal : desc_diagonal;
      diagonal(p, x0 + xi * scale, y0 + yi * scale, ux, uy, shuffle(selected_cols));
    }
  }
};

const requirement_triangle_quad = (w, h) =>
  is_integer(w) && is_integer(h) && w > 1 && h > 1;
const display_triangle_quad = function(p, x0, y0, w, h, scale, cols) {
  let sc = get_random_subset(cols, 2);
  if (sc.length < 4) sc = sc.concat(sc);
  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const diagonal = (xi + yi) % 2 === 0 ? asc_diagonal : desc_diagonal;
      const col_pair =
        yi % 2 === 0
          ? xi % 2 === 0
            ? [sc[0], sc[1]]
            : [sc[2], sc[3]]
          : xi % 2 === 0
          ? [sc[3], sc[2]]
          : [sc[1], sc[0]];
      diagonal(p, x0 + xi * scale, y0 + yi * scale, ux, uy, col_pair);
    }
  }
};

export default [
  [requirement_triangle_random, display_triangle_random],
  [requirement_triangle_quad, display_triangle_quad]
];
