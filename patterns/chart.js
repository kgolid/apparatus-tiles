import { shuffle, get_random, get_random_subset, is_integer } from '../utils';
import { pie, bar, column } from '../tiles/chart';

const requirement_pie_random = (w, h, sc) => is_integer(w) && is_integer(h);
const display_pie_random = function(p, x0, y0, w, h, scale, cols) {
  cols = get_random_subset(cols, 2);
  const ux = [scale, 0];
  const uy = [0, scale];

  for (let yi = 0; yi < h; yi += 1) {
    for (let xi = 0; xi < w; xi += 1) {
      const shuffled = cols.length < 3 ? [get_random(cols), ...cols] : shuffle(cols);
      const r0 = (Math.floor(Math.random() * 10) / 10) * p.TWO_PI;
      const r1 = (Math.floor(Math.random() * 10) / 10) * p.TWO_PI;
      pie(p, x0 + xi * scale, y0 + yi * scale, ux, uy, shuffled, r0, r1);
    }
  }
};

const requirement_bar = (w, h) => is_integer(w) && is_integer(h) && w > 1 && h > 1;
const display_bar = function(p, x0, y0, w, h, scale, cols) {
  const ux = [scale * w, 0];
  const uy = [0, scale];
  const shuffled1 = cols.length < 3 ? p.shuffle(cols.concat(cols)) : p.shuffle(cols);
  const shuffled2 = cols.length < 3 ? p.shuffle(cols.concat(cols)) : p.shuffle(cols);
  const least_unit = scale / 2;

  for (let yi = 0; yi < h; yi++) {
    const ra = Math.floor((ux[0] * Math.random()) / least_unit) * least_unit;
    const rb = Math.floor((ux[0] * Math.random()) / least_unit) * least_unit;
    const r0 = Math.min(ra, rb);
    const r1 = Math.max(ra, rb);
    const shuffled = yi % 2 === 0 ? shuffled1 : shuffled2;

    bar(p, x0, y0 + yi * scale, ux, uy, shuffled, r0, r1);
  }
};

const requirement_column = (w, h) => is_integer(w) && is_integer(h) && w > 1 && h > 1;
const display_column = function(p, x0, y0, w, h, scale, cols) {
  const ux = [scale, 0];
  const uy = [0, scale * h];
  const shuffled1 = cols.length < 3 ? p.shuffle(cols.concat(cols)) : p.shuffle(cols);
  const shuffled2 = cols.length < 3 ? p.shuffle(cols.concat(cols)) : p.shuffle(cols);
  const least_unit = scale / 2;

  for (let xi = 0; xi < w; xi++) {
    const ra = Math.floor((uy[1] * Math.random()) / least_unit) * least_unit;
    const rb = Math.floor((uy[1] * Math.random()) / least_unit) * least_unit;
    const r0 = Math.min(ra, rb);
    const r1 = Math.max(ra, rb);
    const shuffled = xi % 2 === 0 ? shuffled1 : shuffled2;

    column(p, x0 + xi * scale, y0, ux, uy, shuffled, r0, r1);
  }
};

export default [
  [requirement_pie_random, display_pie_random],
  [requirement_bar, display_bar],
  [requirement_column, display_column]
];
