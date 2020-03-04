import ApparatusGenerator from 'apparatus-generator';
import * as tome from 'chromotome';
import { convert_to_app_dim, get_random } from './utils';
import patterns from './patterns';

const grid_dim_x = 40;
const grid_dim_y = 40;
const cell_scale = 20;

const tile_scales = [1, 2, 3, 4, 5];

const frame_mode = false;

const apparatus_generator = initialize_apparatus();
const palette = tome.get('empusa');

function initialize_apparatus() {
  const app_x = convert_to_app_dim(grid_dim_x);
  const app_y = convert_to_app_dim(grid_dim_y);

  return new ApparatusGenerator(app_x, app_y, {
    simple: true,
    horizontal_symmetry: false,
    vertical_chance: 0.5,
    extension_chance: 0.9
  });
}

let sketch = function(p) {
  let THE_SEED;

  p.setup = function() {
    p.createCanvas(800, 800);
    p.background(0);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.noStroke();
    p.noLoop();
  };

  p.draw = function() {
    p.translate(-cell_scale, -cell_scale);
    display_apparatus();
  };

  function display_apparatus() {
    const app = apparatus_generator.generate();
    app.forEach(r => {
      const suitable = get_suitable_pattern_with_scale(r, patterns);
      display_pattern(r, suitable.pattern, suitable.scale);
    });

    if (frame_mode) display_frames(app);
  }

  function get_suitable_pattern_with_scale(rect, patterns) {
    const suitables = tile_scales.flatMap(sc =>
      patterns
        .filter(pt => pt[0](rect.w / sc, rect.h / sc, sc))
        .map(pt => ({ pattern: pt[1], scale: sc }))
    );
    return get_random(suitables);
  }

  function display_pattern(rect, pattern, scale) {
    pattern(
      p,
      rect.x1 * cell_scale,
      rect.y1 * cell_scale,
      rect.w / scale,
      rect.h / scale,
      scale * cell_scale,
      palette.colors
    );
  }

  function display_frames(app) {
    p.stroke('#000');
    p.strokeWeight(3);
    p.noFill();
    app.forEach(r => {
      p.rect(r.x1 * cell_scale, r.y1 * cell_scale, r.w * cell_scale, r.h * cell_scale);
    });
  }

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
  };
};
new p5(sketch);
