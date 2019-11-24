(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  class index {
    constructor(
      width,
      height,
      {
        initiate_chance = 0.8,
        extension_chance = 0.8,
        vertical_chance = 0.8,
        horizontal_symmetry = true,
        vertical_symmetry = false,
        roundness = 0.1,
        solidness = 0.5,
        colors = [],
        color_mode = 'group',
        group_size = 0.8,
        simple = false,
      } = {}
    ) {
      this.xdim = Math.round(width * 2 + 11, 0);
      this.ydim = Math.round(height * 2 + 11, 0);
      this.radius_x = width;
      this.radius_y = height;
      this.chance_new = initiate_chance;
      this.chance_extend = extension_chance;
      this.chance_vertical = vertical_chance;
      this.colors = colors;
      this.color_mode = color_mode;
      this.group_size = group_size;
      this.h_symmetric = horizontal_symmetry;
      this.v_symmetric = vertical_symmetry;
      this.roundness = roundness;
      this.solidness = solidness;
      this.simple = simple;
    }

    generate(initial_top = null, initial_left = null, verbose = false) {
      this.main_color = get_random(this.colors);
      this.id_counter = 0;

      let grid = new Array(this.ydim + 1);
      for (var i = 0; i < grid.length; i++) {
        grid[i] = new Array(this.xdim + 1);
        for (var j = 0; j < grid[i].length; j++) {
          if (i == 0 || j == 0) grid[i][j] = { h: false, v: false, in: false, col: null };
          else if (i == 1 && initial_top != null) grid[i][j] = { ...initial_top[j], h: true };
          else if (j == 1 && initial_left != null) grid[i][j] = { ...initial_left[i], v: true };
          else if (this.h_symmetric && j > grid[i].length / 2) {
            grid[i][j] = deep_copy(grid[i][grid[i].length - j]);
            grid[i][j].v = grid[i][grid[i].length - j + 1].v;
          } else if (this.v_symmetric && i > grid.length / 2) {
            grid[i][j] = deep_copy(grid[grid.length - i][j]);
            grid[i][j].h = grid[grid.length - i + 1][j].h;
          } else {
            grid[i][j] = this.next_block(j, i, grid[i][j - 1], grid[i - 1][j]);
          }
        }
      }
      let rects = convert_linegrid_to_rectangles(grid);
      return verbose ? [rects, grid] : rects;
    }

    next_block(x, y, left, top) {
      const context = this;

      if (!left.in && !top.in) {
        return block_set_1(x, y);
      }

      if (left.in && !top.in) {
        if (left.h) return block_set_3(x, y);
        return block_set_2(x, y);
      }

      if (!left.in && top.in) {
        if (top.v) return block_set_5(x, y);
        return block_set_4(x, y);
      }

      if (left.in && top.in) {
        if (!left.h && !top.v) return block_set_6();
        if (left.h && !top.v) return block_set_7(x, y);
        if (!left.h && top.v) return block_set_8(x, y);
        return block_set_9(x, y);
      }

      // --- Block sets ----

      function block_set_1(x, y) {
        if (start_new_from_blank(x, y)) return new_block();
        return { v: false, h: false, in: false, col: null, id: null };
      }

      function block_set_2(x, y) {
        if (start_new_from_blank(x, y)) return new_block();
        return { v: true, h: false, in: false, col: null, id: null };
      }

      function block_set_3(x, y) {
        if (extend(x, y)) return { v: false, h: true, in: true, col: left.col, id: left.id };
        return block_set_2(x, y);
      }

      function block_set_4(x, y) {
        if (start_new_from_blank(x, y)) return new_block();
        return { v: false, h: true, in: false, col: null, id: null };
      }

      function block_set_5(x, y) {
        if (extend(x, y)) return { v: true, h: false, in: true, col: top.col, id: top.id };
        return block_set_4(x, y);
      }

      function block_set_6() {
        return { v: false, h: false, in: true, col: left.col, id: left.id };
      }

      function block_set_7(x, y) {
        if (extend(x, y)) return { v: false, h: true, in: true, col: left.col, id: left.id };
        if (start_new(x, y)) return new_block();
        return { v: true, h: true, in: false, col: null, id: null };
      }

      function block_set_8(x, y) {
        if (extend(x, y)) return { v: true, h: false, in: true, col: top.col, id: top.id };
        if (start_new(x, y)) return new_block();
        return { v: true, h: true, in: false, col: null, id: null };
      }

      function block_set_9(x, y) {
        if (vertical_dir()) return { v: true, h: false, in: true, col: top.col, id: top.id };
        return { v: false, h: true, in: true, col: left.col, id: left.id };
      }

      // ---- Blocks ----

      function new_block() {
        let col;
        if (context.color_mode === 'random') {
          col = get_random(context.colors);
        } else if (context.color_mode === 'main') {
          col = Math.random() > 0.75 ? get_random(context.colors) : context.main_color;
        } else if (context.color_mode === 'group') {
          let keep = Math.random() > 0.5 ? left.col : top.col;
          context.main_color =
            Math.random() > context.group_size ? get_random(context.colors) : keep || context.main_color;
          col = context.main_color;
        } else {
          col = context.main_color;
        }

        return { v: true, h: true, in: true, col: col, id: context.id_counter++ };
      }

      // ---- Decisions ----

      function start_new_from_blank(x, y) {
        if (context.simple) return true;
        if (!active_position(x, y, -1 * (1 - context.roundness))) return false;
        return Math.random() <= context.solidness;
      }

      function start_new(x, y) {
        if (context.simple) return true;
        if (!active_position(x, y, 0)) return false;
        return Math.random() <= context.chance_new;
      }

      function extend(x, y) {
        if (!active_position(x, y, 1 - context.roundness) && !context.simple) return false;
        return Math.random() <= context.chance_extend;
      }

      function vertical_dir() {
        return Math.random() <= context.chance_vertical;
      }

      function active_position(x, y, fuzzy) {
        let fuzziness = 1 + Math.random() * fuzzy;
        let xa = Math.pow(x - context.xdim / 2, 2) / Math.pow(context.radius_x * fuzziness, 2);
        let ya = Math.pow(y - context.ydim / 2, 2) / Math.pow(context.radius_y * fuzziness, 2);
        return xa + ya < 1;
      }
    }
  }

  function get_random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function deep_copy(obj) {
    let nobj = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        nobj[key] = obj[key];
      }
    }
    return nobj;
  }

  // --- Conversion ---
  function convert_linegrid_to_rectangles(grid) {
    let nw_corners = get_nw_corners(grid);
    extend_corners_to_rectangles(nw_corners, grid);
    return nw_corners;
  }

  function get_nw_corners(grid) {
    let nw_corners = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let cell = grid[i][j];
        if (cell.h && cell.v && cell.in) nw_corners.push({ x1: j, y1: i, col: cell.col, id: cell.id });
      }
    }
    return nw_corners;
  }

  function extend_corners_to_rectangles(corners, grid) {
    corners.map(c => {
      let accx = 1;
      while (c.x1 + accx < grid[c.y1].length && !grid[c.y1][c.x1 + accx].v) {
        accx++;
      }
      let accy = 1;
      while (c.y1 + accy < grid.length && !grid[c.y1 + accy][c.x1].h) {
        accy++;
      }
      c.w = accx;
      c.h = accy;
      return c;
    });
  }

  var contrast = [
    {
      name: 'bekk00',
      colors: [
        '#FF8034',
        '#7E9CB9',
        '#43CBFF',
        '#CECECE',
        '#FF5B5B',
        '#FFF02B',
        '#8E24C9',
        '#16DBC4',
        '#162365'
      ],
      background: '#0E0E0E',
      stroke: '#FFFFFF'
    },
    {
      name: 'bekk01',
      colors: ['#162365', '#FF5B5B', '#16DBC4'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk02',
      colors: ['#FF8034', '#162365', '#16DBC4'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk03',
      colors: ['#FFF02B', '#FF5B5B', '#16DBC4'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk04',
      colors: ['#43CBFF', '#FFF02B', '#FF8034'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk05',
      colors: ['#8E24C9', '#162365', '#FF8034'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk06',
      colors: ['#FF5B5B', '#7E9CB9', '#8E24C9'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk07',
      colors: ['#43CBFF', '#8E24C9', '#162365'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk08',
      colors: ['#FFF02B', '#FF8034', '#162365'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk09',
      colors: ['#7E9CB9', '#43CBFF', '#16DBC4'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk10',
      colors: ['#162365', '#FF5B5B', '#FFF02B'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk11',
      colors: ['#FFF02B', '#43CBFF', '#FF5B5B'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk12',
      colors: ['#16DBC4', '#FFF02B', '#162365'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    }
  ];

  var pastel = [
    {
      name: 'bekk00b',
      colors: [
        '#FFB88D',
        '#BCCEDD',
        '#B1E8FF',
        '#E7E7E7',
        '#FF9999',
        '#FFF2AD',
        '#E5B1FF',
        '#A1F5E3',
        '#6D7ABB'
      ],
      background: '#0E0E0E',
      stroke: '#FFFFFF'
    },
    {
      name: 'bekk01b',
      colors: ['#6D7ABB', '#FF9999', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk02b',
      colors: ['#FFB88D', '#6D7ABB', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk03b',
      colors: ['#FFF2AD', '#FF9999', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk04b',
      colors: ['#B1E8FF', '#FFF2AD', '#FFB88D'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk05b',
      colors: ['#E5B1FF', '#6D7ABB', '#FFB88D'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk06b',
      colors: ['#FF9999', '#BCCEDD', '#E5B1FF'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk07b',
      colors: ['#B1E8FF', '#E5B1FF', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk08b',
      colors: ['#FFF2AD', '#FFB88D', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk09b',
      colors: ['#BCCEDD', '#B1E8FF', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk10b',
      colors: ['#6D7ABB', '#FF9999', '#FFF2AD'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk11b',
      colors: ['#FFF2AD', '#B1E8FF', '#FF9999'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk12b',
      colors: ['#A1F5E3', '#FFF2AD', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    }
  ];

  var mixed = [
    {
      name: 'bekk01m',
      colors: ['#162365', '#FF5B5B', '#16DBC4', '#6D7ABB', '#FF9999', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk02m',
      colors: ['#FF8034', '#162365', '#16DBC4', '#FFB88D', '#6D7ABB', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk03m',
      colors: ['#FFF02B', '#FF5B5B', '#16DBC4', '#FFF2AD', '#FF9999', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk04m',
      colors: ['#43CBFF', '#FFF02B', '#FF8034', '#B1E8FF', '#FFF2AD', '#FFB88D'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk05m',
      colors: ['#8E24C9', '#162365', '#FF8034', '#E5B1FF', '#6D7ABB', '#FFB88D'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk06m',
      colors: ['#FF5B5B', '#7E9CB9', '#8E24C9', '#FF9999', '#BCCEDD', '#E5B1FF'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk07m',
      colors: ['#43CBFF', '#8E24C9', '#162365', '#B1E8FF', '#E5B1FF', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk08m',
      colors: ['#FFF02B', '#FF8034', '#162365', '#FFF2AD', '#FFB88D', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk09m',
      colors: ['#7E9CB9', '#43CBFF', '#16DBC4', '#BCCEDD', '#B1E8FF', '#A1F5E3'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk10m',
      colors: ['#162365', '#FF5B5B', '#FFF02B', '#6D7ABB', '#FF9999', '#FFF2AD'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk11m',
      colors: ['#FFF02B', '#43CBFF', '#FF5B5B', '#FFF2AD', '#B1E8FF', '#FF9999'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    },
    {
      name: 'bekk12m',
      colors: ['#16DBC4', '#FFF02B', '#162365', '#A1F5E3', '#FFF2AD', '#6D7ABB'],
      stroke: '#0E0E0E',
      background: '#FFFFFF'
    }
  ];

  const pals = contrast.concat(pastel, mixed);

  var palettes = pals.map(p => {
    p.size = p.colors.length;
    return p;
  });

  function getRandom() {
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  function get(name) {
    if (name === undefined) return getRandom();
    return palettes.find(pal => pal.name == name);
  }

  const convert_to_app_dim = num => (num - 11) / 2;

  const get_random$1 = arr => arr[Math.floor(Math.random() * arr.length)];

  const get_random_subset = (arr, min_length) => {
    const interval = arr.length + 1 - min_length;
    if (interval <= 0) return shuffle(arr);

    const num_cols = min_length + Math.floor(Math.random() * interval);
    return shuffle(arr).slice(0, num_cols);
  };

  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const is_integer = num => num % 1 < 0.0001;

  function solid(p, x, y, ux, uy, cols) {
    p.fill(cols[0]);
    p.beginShape();
    p.vertex(x, y);
    p.vertex(x + ux[0] + uy[0], y);
    p.vertex(x + ux[0] + uy[0], y + ux[1] + uy[1]);
    p.vertex(x, y + ux[1] + uy[1]);
    p.endShape(p.CLOSE);
  }

  function vertical_half(p, x, y, ux, uy, cols) {
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

  function horizontal_half(p, x, y, ux, uy, cols) {
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

  var solid$1 = [
    [requirement_solid_random, display_solid_random],
    [requirement_solid_sequential, display_solid_sequential]
  ];

  function dot(p, x, y, ux, uy, cols) {
    solid(p, x, y, ux, uy, cols);
    p.fill(cols[1]);
    const cx = (ux[0] + uy[0]) / 2;
    const cy = (ux[1] + uy[1]) / 2;
    p.ellipse(x + cx, y + cy, cx, cy);
  }

  function v_half_dot(p, x, y, ux, uy, cols) {
    vertical_half(p, x, y, ux, uy, cols);
    p.fill(cols[2]);
    const cx = (ux[0] + uy[0]) / 2;
    const cy = (ux[1] + uy[1]) / 2;
    p.ellipse(x + cx, y + cy, cx, cy);
  }

  function h_half_dot(p, x, y, ux, uy, cols) {
    horizontal_half(p, x, y, ux, uy, cols);
    p.fill(cols[2]);
    const cx = (ux[0] + uy[0]) / 2;
    const cy = (ux[1] + uy[1]) / 2;
    p.ellipse(x + cx, y + cy, cx, cy);
  }

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
        const col = get_random$1(selected_cols);
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
        const col = get_random$1(selected_cols);
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
        const col = get_random$1(selected_cols);
        h_half_dot(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [...bg_cols, col]);
      }
    }
  };

  var dot$1 = [
    [requirement_dots_random, display_dots_random],
    [requirement_h_half_dots_random, display_h_half_dots_random],
    [requirement_v_half_dots_random, display_v_half_dots_random]
  ];

  function asc_diagonal(p, x, y, ux, uy, cols) {
    p.fill(cols[0]);
    solid(p, x, y, ux, uy, cols);
    p.fill(cols[1]);
    p.beginShape();
    p.vertex(x, y);
    p.vertex(x + (ux[0] + uy[0]), y);
    p.vertex(x, y + ux[1] + uy[1]);
    p.endShape(p.CLOSE);
  }

  function desc_diagonal(p, x, y, ux, uy, cols) {
    const ny = y + uy[1];
    const nx = x + uy[0];
    asc_diagonal(p, nx, ny, ux, [-uy[0], -uy[1]], cols);
  }

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

  var triangle = [
    [requirement_triangle_random, display_triangle_random],
    [requirement_triangle_quad, display_triangle_quad]
  ];

  function pie(p, x, y, ux, uy, cols, r0, r1) {
    solid(p, x, y, ux, uy, cols);
    const cx = (ux[0] + uy[0]) / 2;
    const cy = (ux[1] + uy[1]) / 2;
    p.fill(cols[1]);
    p.arc(x + cx, y + cy, cx * 1.5, cy * 1.5, r0, r1, p.PIE);
    p.fill(cols[2]);
    p.arc(x + cx, y + cy, cx * 1.5, cy * 1.5, r1, r0, p.PIE);
  }

  function bar(p, x, y, ux, uy, cols, rx0, rx1) {
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

  function column(p, x, y, ux, uy, cols, r0, r1) {
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

  const requirement_pie_random = (w, h, sc) => is_integer(w) && is_integer(h) && sc > 1;
  const display_pie_random = function(p, x0, y0, w, h, scale, cols) {
    const shuffled = shuffle(cols);
    const main_cols = shuffled.slice(0, 2);
    const selected_cols = shuffled.slice(2);

    const ux = [scale, 0];
    const uy = [0, scale];

    for (let yi = 0; yi < h; yi += 1) {
      for (let xi = 0; xi < w; xi += 1) {
        const col = get_random$1(selected_cols);
        const r0 = (Math.floor(Math.random() * 30) / 30) * p.TWO_PI;
        const r1 = (Math.floor(Math.random() * 30) / 30) * p.TWO_PI;
        pie(p, x0 + xi * scale, y0 + yi * scale, ux, uy, [...main_cols, col], r0, r1);
      }
    }
  };

  const requirement_bar = (w, h) => is_integer(w) && is_integer(h) && w > 1 && h > 1;
  const display_bar = function(p, x0, y0, w, h, scale, cols) {
    const ux = [scale * w, 0];
    const uy = [0, scale];
    const shuffled1 = p.shuffle(cols);
    const shuffled2 = p.shuffle(cols);
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
    const shuffled1 = p.shuffle(cols);
    const shuffled2 = p.shuffle(cols);
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

  var chart = [
    [requirement_pie_random, display_pie_random],
    [requirement_bar, display_bar],
    [requirement_column, display_column]
  ];

  var patterns = [].concat(solid$1, dot$1, triangle, chart);

  const grid_dim_x = 40;
  const grid_dim_y = 40;
  const cell_scale = 20;

  const tile_scales = [1, 2, 3, 4];

  const apparatus_generator = initialize_apparatus();
  const palette = get('bekk01m');

  function initialize_apparatus() {
    const app_x = convert_to_app_dim(grid_dim_x);
    const app_y = convert_to_app_dim(grid_dim_y);

    return new index(app_x, app_y, {
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
    }

    function get_suitable_pattern_with_scale(rect, patterns$$1) {
      const suitables = tile_scales.flatMap(sc =>
        patterns$$1
          .filter(pt => pt[0](rect.w / sc, rect.h / sc, sc))
          .map(pt => ({ pattern: pt[1], scale: sc }))
      );
      return get_random$1(suitables);
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

    p.keyPressed = function() {
      if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
    };
  };
  new p5(sketch);

}));
