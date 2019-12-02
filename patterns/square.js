import { shuffle, is_integer } from '../utils';
import { square } from '../tiles/square';

const requirement_square_random = (w, h, sc) => is_integer(w) && is_integer(h);
const display_square_random = function(p, x0, y0, w, h, scale, cols) {
  const pad = 0.25 * scale;

  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      square(p, x0 + xi * scale, y0 + yi * scale, ux, uy, shuffle(cols), pad);
    }
  }
};

export default [[requirement_square_random, display_square_random]];
