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

  var misc = [
    {
      name: 'frozen-rose',
      colors: ['#29368f', '#e9697b', '#1b164d', '#f7d996'],
      background: '#f2e8e4'
    },
    {
      name: 'winter-night',
      colors: ['#122438', '#dd672e', '#87c7ca', '#ebebeb'],
      background: '#ebebeb'
    },
    {
      name: 'saami',
      colors: ['#eab700', '#e64818', '#2c6393', '#eecfca'],
      background: '#e7e6e4'
    },
    {
      name: 'knotberry1',
      colors: ['#20342a', '#f74713', '#686d2c', '#e9b4a6'],
      background: '#e5ded8'
    },
    {
      name: 'knotberry2',
      colors: ['#1d3b1a', '#eb4b11', '#e5bc00', '#f29881'],
      background: '#eae2d0'
    },
    {
      name: 'tricolor',
      colors: ['#ec643b', '#56b7ab', '#f8cb57', '#1f1e43'],
      background: '#f7f2df'
    },
    {
      name: 'foxshelter',
      colors: ['#ff3931', '#007861', '#311f27', '#bab9a4'],
      background: '#dddddd'
    },
    {
      name: 'hermes',
      colors: ['#253852', '#51222f', '#b53435', '#ecbb51'],
      background: '#eeccc2'
    },
    {
      name: 'olympia',
      colors: ['#ff3250', '#ffb33a', '#008c36', '#0085c6', '#4c4c4c'],
      stroke: '#0b0b0b',
      background: '#faf2e5'
    },
    {
      name: 'byrnes',
      colors: ['#c54514', '#dca215', '#23507f'],
      stroke: '#0b0b0b',
      background: '#e8e7d4'
    },
    {
      name: 'butterfly',
      colors: ['#f40104', '#f6c0b3', '#99673a', '#f0f1f4'],
      stroke: '#191e36',
      background: '#191e36'
    },
    {
      name: 'floratopia',
      colors: ['#bf4a2b', '#cd902a', '#4e4973', '#f5d4bc'],
      stroke: '#1e1a43',
      background: '#1e1a43'
    },
    {
      name: 'verena',
      colors: ['#f1594a', '#f5b50e', '#14a160', '#2969de', '#885fa4'],
      stroke: '#1a1a1a',
      background: '#e2e6e8'
    },
    {
      name: 'empusa',
      colors: [
        '#c92a28',
        '#e69301',
        '#1f8793',
        '#13652b',
        '#e7d8b0',
        '#48233b',
        '#e3b3ac'
      ],
      stroke: '#1a1a1a',
      background: '#f0f0f2'
    },
    {
      name: 'florida_citrus',
      colors: ['#ea7251', '#ebf7f0', '#02aca5'],
      stroke: '#050100',
      background: '#9ae2d3'
    },
    {
      name: 'lemon_citrus',
      colors: ['#e2d574', '#f1f4f7', '#69c5ab'],
      stroke: '#463231',
      background: '#f79eac'
    },
    {
      name: 'yuma_punk',
      colors: ['#f05e3b', '#ebdec4', '#ffdb00'],
      stroke: '#ebdec4',
      background: '#161616'
    },
    {
      name: 'moir',
      colors: ['#a49f4f', '#d4501e', '#f7c558', '#ebbaa6'],
      stroke: '#161716',
      background: '#f7f4ef'
    },
    {
      name: 'sprague',
      colors: ['#ec2f28', '#f8cd28', '#1e95bb', '#fbaab3', '#fcefdf'],
      stroke: '#221e1f',
      background: '#fcefdf'
    },
    {
      name: 'bloomberg',
      colors: ['#ff5500', '#f4c145', '#144714', '#2f04fc', '#e276af'],
      stroke: '#000',
      background: '#fff3dd'
    },
    {
      name: 'revolucion',
      colors: ['#ed555d', '#fffcc9', '#41b797', '#eda126', '#7b5770'],
      stroke: '#fffcc9',
      background: '#2d1922'
    },
    {
      name: 'sneaker',
      colors: ['#e8165b', '#401e38', '#66c3b4', '#ee7724', '#584098'],
      stroke: '#401e38',
      background: '#ffffff'
    },
    {
      name: 'miradors',
      colors: ['#ff6936', '#fddc3f', '#0075ca', '#00bb70'],
      stroke: '#ffffff',
      background: '#020202'
    }
  ];

  var colourscafe = [
    {
      name: 'cc239',
      colors: ['#e3dd34', '#78496b', '#f0527f', '#a7e0e2'],
      background: '#e0eff0'
    },
    {
      name: 'cc234',
      colors: ['#ffce49', '#ede8dc', '#ff5736', '#ff99b4'],
      background: '#f7f4ed'
    },
    {
      name: 'cc232',
      colors: ['#5c5f46', '#ff7044', '#ffce39', '#66aeaa'],
      background: '#e9ecde'
    },
    {
      name: 'cc238',
      colors: ['#553c60', '#ffb0a0', '#ff6749', '#fbe090'],
      background: '#f5e9de'
    },
    {
      name: 'cc242',
      colors: ['#bbd444', '#fcd744', '#fa7b53', '#423c6f'],
      background: '#faf4e4'
    },
    {
      name: 'cc245',
      colors: ['#0d4a4e', '#ff947b', '#ead3a2', '#5284ab'],
      background: '#f6f4ed'
    },
    {
      name: 'cc273',
      colors: ['#363d4a', '#7b8a56', '#ff9369', '#f4c172'],
      background: '#f0efe2'
    }
  ];

  var ranganath = [
    {
      name: 'rag-mysore',
      colors: ['#ec6c26', '#613a53', '#e8ac52', '#639aa0'],
      background: '#d5cda1'
    },
    {
      name: 'rag-gol',
      colors: ['#d3693e', '#803528', '#f1b156', '#90a798'],
      background: '#f0e0a4'
    },
    {
      name: 'rag-belur',
      colors: ['#f46e26', '#68485f', '#3d273a', '#535d55'],
      background: '#dcd4a6'
    },
    {
      name: 'rag-bangalore',
      colors: ['#ea720e', '#ca5130', '#e9c25a', '#52534f'],
      background: '#f9ecd3'
    },
    {
      name: 'rag-taj',
      colors: ['#ce565e', '#8e1752', '#f8a100', '#3ac1a6'],
      background: '#efdea2'
    },
    {
      name: 'rag-virupaksha',
      colors: ['#f5736a', '#925951', '#feba4c', '#9d9b9d'],
      background: '#eedfa2'
    }
  ];

  var roygbivs = [
    {
      name: 'retro',
      colors: [
        '#69766f',
        '#9ed6cb',
        '#f7e5cc',
        '#9d8f7f',
        '#936454',
        '#bf5c32',
        '#efad57'
      ]
    },
    {
      name: 'retro-washedout',
      colors: [
        '#878a87',
        '#cbdbc8',
        '#e8e0d4',
        '#b29e91',
        '#9f736c',
        '#b76254',
        '#dfa372'
      ]
    },
    {
      name: 'roygbiv-warm',
      colors: [
        '#705f84',
        '#687d99',
        '#6c843e',
        '#fc9a1a',
        '#dc383a',
        '#aa3a33',
        '#9c4257'
      ]
    },
    {
      name: 'roygbiv-toned',
      colors: [
        '#817c77',
        '#396c68',
        '#89e3b7',
        '#f59647',
        '#d63644',
        '#893f49',
        '#4d3240'
      ]
    },
    {
      name: 'present-correct',
      colors: [
        '#fd3741',
        '#fe4f11',
        '#ff6800',
        '#ffa61a',
        '#ffc219',
        '#ffd114',
        '#fcd82e',
        '#f4d730',
        '#ced562',
        '#8ac38f',
        '#79b7a0',
        '#72b5b1',
        '#5b9bae',
        '#6ba1b7',
        '#49619d',
        '#604791',
        '#721e7f',
        '#9b2b77',
        '#ab2562',
        '#ca2847'
      ]
    }
  ];

  var tundra = [
    {
      name: 'tundra1',
      colors: ['#40708c', '#8e998c', '#5d3f37', '#ed6954', '#f2e9e2']
    },
    {
      name: 'tundra2',
      colors: ['#5f9e93', '#3d3638', '#733632', '#b66239', '#b0a1a4', '#e3dad2']
    },
    {
      name: 'tundra3',
      colors: [
        '#87c3ca',
        '#7b7377',
        '#b2475d',
        '#7d3e3e',
        '#eb7f64',
        '#d9c67a',
        '#f3f2f2'
      ]
    },
    {
      name: 'tundra4',
      colors: [
        '#d53939',
        '#b6754d',
        '#a88d5f',
        '#524643',
        '#3c5a53',
        '#7d8c7c',
        '#dad6cd'
      ]
    }
  ];

  var rohlfs = [
    {
      name: 'rohlfs_1R',
      colors: ['#004996', '#567bae', '#ff4c48', '#ffbcb3'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_1Y',
      colors: ['#004996', '#567bae', '#ffc000', '#ffdca4'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_1G',
      colors: ['#004996', '#567bae', '#60bf3c', '#d2deb1'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_2',
      colors: ['#4d3d9a', '#f76975', '#ffffff', '#eff0dd'],
      stroke: '#211029',
      background: '#58bdbc'
    },
    {
      name: 'rohlfs_3',
      colors: ['#abdfdf', '#fde500', '#58bdbc', '#eff0dd'],
      stroke: '#211029',
      background: '#f76975'
    },
    {
      name: 'rohlfs_4',
      colors: ['#fde500', '#2f2043', '#f76975', '#eff0dd'],
      stroke: '#211029',
      background: '#fbbeca'
    }
  ];

  var ducci = [
    {
      name: 'ducci_jb',
      colors: ['#395e54', '#e77b4d', '#050006', '#e55486'],
      stroke: '#050006',
      background: '#efe0bc'
    },
    {
      name: 'ducci_a',
      colors: ['#809498', '#d3990e', '#000000', '#ecddc5'],
      stroke: '#ecddc5',
      background: '#863f52'
    },
    {
      name: 'ducci_b',
      colors: ['#ecddc5', '#79b27b', '#000000', '#ac6548'],
      stroke: '#ac6548',
      background: '#d5c08e'
    },
    {
      name: 'ducci_d',
      colors: ['#f3cb4d', '#f2f5e3', '#20191b', '#67875c'],
      stroke: '#67875c',
      background: '#433d5f'
    },
    {
      name: 'ducci_e',
      colors: ['#c37c2b', '#f6ecce', '#000000', '#386a7a'],
      stroke: '#386a7a',
      background: '#e3cd98'
    },
    {
      name: 'ducci_f',
      colors: ['#596f7e', '#eae6c7', '#463c21', '#f4cb4c'],
      stroke: '#f4cb4c',
      background: '#e67300'
    },
    {
      name: 'ducci_g',
      colors: ['#c75669', '#000000', '#11706a'],
      stroke: '#11706a',
      background: '#ecddc5'
    },
    {
      name: 'ducci_h',
      colors: ['#6b5c6e', '#4a2839', '#d9574a'],
      stroke: '#d9574a',
      background: '#ffc34b'
    },
    {
      name: 'ducci_i',
      colors: ['#e9dcad', '#143331', '#ffc000'],
      stroke: '#ffc000',
      background: '#a74c02'
    },
    {
      name: 'ducci_j',
      colors: ['#c47c2b', '#5f5726', '#000000', '#7e8a84'],
      stroke: '#7e8a84',
      background: '#ecddc5'
    },
    {
      name: 'ducci_o',
      colors: ['#c15e1f', '#e4a13a', '#000000', '#4d545a'],
      stroke: '#4d545a',
      background: '#dfc79b'
    },
    {
      name: 'ducci_q',
      colors: ['#4bae8c', '#d0c1a0', '#2d3538'],
      stroke: '#2d3538',
      background: '#d06440'
    },
    {
      name: 'ducci_u',
      colors: ['#f6d700', '#f2d692', '#000000', '#5d3552'],
      stroke: '#5d3552',
      background: '#ff7426'
    },
    {
      name: 'ducci_v',
      colors: ['#c65f75', '#d3990e', '#000000', '#597e7a'],
      stroke: '#597e7a',
      background: '#f6eccb'
    },
    {
      name: 'ducci_x',
      colors: ['#dd614a', '#f5cedb', '#1a1e4f'],
      stroke: '#1a1e4f',
      background: '#fbb900'
    }
  ];

  var judson = [
    {
      name: 'jud_playground',
      colors: ['#f04924', '#fcce09', '#408ac9'],
      stroke: '#2e2925',
      background: '#ffffff'
    },
    {
      name: 'jud_horizon',
      colors: ['#f8c3df', '#f2e420', '#28b3d0', '#648731', '#ef6a7d'],
      stroke: '#030305',
      background: '#f2f0e1'
    },
    {
      name: 'jud_mural',
      colors: ['#ca3122', '#e5af16', '#4a93a2', '#0e7e39', '#e2b9bd'],
      stroke: '#1c1616',
      background: '#e3ded8'
    },
    {
      name: 'jud_cabinet',
      colors: ['#f0afb7', '#f6bc12', '#1477bb', '#41bb9b'],
      stroke: '#020508',
      background: '#e3ded8'
    }
  ];

  var iivonen = [
    {
      name: 'iiso_zeitung',
      colors: ['#ee8067', '#f3df76', '#00a9c0', '#f7ab76'],
      stroke: '#111a17',
      background: '#f5efcb'
    },
    {
      name: 'iiso_curcuit',
      colors: ['#f0865c', '#f2b07b', '#6bc4d2', '#1a3643'],
      stroke: '#0f1417',
      background: '#f0f0e8'
    },
    {
      name: 'iiso_airlines',
      colors: ['#fe765a', '#ffb468', '#4b588f', '#faf1e0'],
      stroke: '#1c1616',
      background: '#fae5c8'
    },
    {
      name: 'iiso_daily',
      colors: ['#e76c4a', '#f0d967', '#7f8cb6', '#1daeb1', '#ef9640'],
      stroke: '#000100',
      background: '#e2ded2'
    }
  ];

  var kovecses = [
    {
      name: 'kov_01',
      colors: ['#d24c23', '#7ba6bc', '#f0c667', '#ede2b3', '#672b35', '#142a36'],
      stroke: '#132a37',
      background: '#108266'
    },
    {
      name: 'kov_02',
      colors: ['#e8dccc', '#e94641', '#eeaeae'],
      stroke: '#e8dccc',
      background: '#6c96be'
    },
    {
      name: 'kov_03',
      colors: ['#e3937b', '#d93f1d', '#090d15', '#e6cca7'],
      stroke: '#090d15',
      background: '#558947'
    },
    {
      name: 'kov_04',
      colors: ['#d03718', '#292b36', '#33762f', '#ead7c9', '#ce7028', '#689d8d'],
      stroke: '#292b36',
      background: '#deb330'
    },
    {
      name: 'kov_05',
      colors: ['#de3f1a', '#de9232', '#007158', '#e6cdaf', '#869679'],
      stroke: '#010006',
      background: '#7aa5a6'
    },
    {
      name: 'kov_06',
      colors: [
        '#a87c2a',
        '#bdc9b1',
        '#f14616',
        '#ecbfaf',
        '#017724',
        '#0e2733',
        '#2b9ae9'
      ],
      stroke: '#292319',
      background: '#dfd4c1'
    },
    {
      name: 'kov_06b',
      colors: [
        '#d57846',
        '#dfe0cc',
        '#de442f',
        '#e7d3c5',
        '#5ec227',
        '#302f35',
        '#63bdb3'
      ],
      stroke: '#292319',
      background: '#dfd4c1'
    },
    {
      name: 'kov_07',
      colors: ['#c91619', '#fdecd2', '#f4a000', '#4c2653'],
      stroke: '#111',
      background: '#89c2cd'
    }
  ];

  var tsuchimochi = [
    {
      name: 'tsu_arcade',
      colors: ['#4aad8b', '#e15147', '#f3b551', '#cec8b8', '#d1af84', '#544e47'],
      stroke: '#251c12',
      background: '#cfc7b9'
    },
    {
      name: 'tsu_harutan',
      colors: ['#75974a', '#c83e3c', '#f39140', '#e4ded2', '#f8c5a4', '#434f55'],
      stroke: '#251c12',
      background: '#cfc7b9'
    },
    {
      name: 'tsu_akasaka',
      colors: ['#687f72', '#cc7d6c', '#dec36f', '#dec7af', '#ad8470', '#424637'],
      stroke: '#251c12',
      background: '#cfc7b9'
    }
  ];

  var duotone = [
    {
      name: 'dt01',
      colors: ['#172a89', '#f7f7f3'],
      stroke: '#172a89',
      background: '#f3abb0'
    },
    {
      name: 'dt02',
      colors: ['#302956', '#f3c507'],
      stroke: '#302956',
      background: '#eee3d3'
    },
    {
      name: 'dt03',
      colors: ['#000000', '#a7a7a7'],
      stroke: '#000000',
      background: '#0a5e78'
    },
    {
      name: 'dt04',
      colors: ['#50978e', '#f7f0df'],
      stroke: '#000000',
      background: '#f7f0df'
    },
    {
      name: 'dt05',
      colors: ['#ee5d65', '#f0e5cb'],
      stroke: '#080708',
      background: '#f0e5cb'
    },
    {
      name: 'dt06',
      colors: ['#271f47', '#e7ceb5'],
      stroke: '#271f47',
      background: '#cc2b1c'
    },
    {
      name: 'dt07',
      colors: ['#6a98a5', '#d24c18'],
      stroke: '#efebda',
      background: '#efebda'
    },
    {
      name: 'dt08',
      colors: ['#5d9d88', '#ebb43b'],
      stroke: '#efebda',
      background: '#efebda'
    },
    {
      name: 'dt09',
      colors: ['#052e57', '#de8d80'],
      stroke: '#efebda',
      background: '#efebda'
    }
  ];

  var hilda = [
    {
      name: 'hilda01',
      colors: ['#ec5526', '#f4ac12', '#9ebbc1', '#f7f4e2'],
      stroke: '#1e1b1e',
      background: '#e7e8d4'
    },
    {
      name: 'hilda02',
      colors: ['#eb5627', '#eebb20', '#4e9eb8', '#f7f5d0'],
      stroke: '#201d13',
      background: '#77c1c0'
    },
    {
      name: 'hilda03',
      colors: ['#e95145', '#f8b917', '#b8bdc1', '#ffb2a2'],
      stroke: '#010101',
      background: '#6b7752'
    },
    {
      name: 'hilda04',
      colors: ['#e95145', '#f6bf7a', '#589da1', '#f5d9bc'],
      stroke: '#000001',
      background: '#f5ede1'
    },
    {
      name: 'hilda05',
      colors: ['#ff6555', '#ffb58f', '#d8eecf', '#8c4b47', '#bf7f93'],
      stroke: '#2b0404',
      background: '#ffda82'
    },
    {
      name: 'hilda06',
      colors: ['#f75952', '#ffce84', '#74b7b2', '#f6f6f6', '#b17d71'],
      stroke: '#0e0603',
      background: '#f6ecd4'
    }
  ];

  var spatial = [
    {
      name: 'spatial01',
      colors: ['#ff5937', '#f6f6f4', '#4169ff'],
      stroke: '#ff5937',
      background: '#f6f6f4'
    },
    {
      name: 'spatial02',
      colors: ['#ff5937', '#f6f6f4', '#f6f6f4'],
      stroke: '#ff5937',
      background: '#f6f6f4'
    },
    {
      name: 'spatial02i',
      colors: ['#f6f6f4', '#ff5937', '#ff5937'],
      stroke: '#f6f6f4',
      background: '#ff5937'
    },

    {
      name: 'spatial03',
      colors: ['#4169ff', '#f6f6f4', '#f6f6f4'],
      stroke: '#4169ff',
      background: '#f6f6f4'
    },
    {
      name: 'spatial03i',
      colors: ['#f6f6f4', '#4169ff', '#4169ff'],
      stroke: '#f6f6f4',
      background: '#4169ff'
    }
  ];

  var jung = [
    {
      name: 'jung_bird',
      colors: ['#fc3032', '#fed530', '#33c3fb', '#ff7bac', '#fda929'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_horse',
      colors: ['#e72e81', '#f0bf36', '#3056a2'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_croc',
      colors: ['#f13274', '#eed03e', '#405e7f', '#19a198'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_hippo',
      colors: ['#ff7bac', '#ff921e', '#3ea8f5', '#7ac943'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_wolf',
      colors: ['#e51c39', '#f1b844', '#36c4b7', '#666666'],
      stroke: '#000000',
      background: '#ffffff'
    }
  ];

  const pals = misc.concat(
    ranganath,
    roygbivs,
    tundra,
    colourscafe,
    rohlfs,
    ducci,
    judson,
    iivonen,
    kovecses,
    tsuchimochi,
    duotone,
    hilda,
    spatial,
    jung
  );

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

  function square(p, x, y, ux, uy, cols, pad) {
    solid(p, x, y, ux, uy, cols);
    p.fill(cols[1]);
    p.beginShape();
    p.vertex(x + pad, y + pad);
    p.vertex(x + (ux[0] + uy[0]) - pad, y + pad);
    p.vertex(x + (ux[0] + uy[0]) - pad, y + (ux[1] + uy[1]) - pad);
    p.vertex(x + pad, y + (ux[1] + uy[1]) - pad);
    p.endShape(p.CLOSE);
  }

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

  var square$1 = [[requirement_square_random, display_square_random]];

  function pie(p, x, y, ux, uy, cols, r0, r1) {
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

  const requirement_pie_random = (w, h, sc) => is_integer(w) && is_integer(h);
  const display_pie_random = function(p, x0, y0, w, h, scale, cols) {
    cols = get_random_subset(cols, 2);
    const ux = [scale, 0];
    const uy = [0, scale];

    for (let yi = 0; yi < h; yi += 1) {
      for (let xi = 0; xi < w; xi += 1) {
        const shuffled = cols.length < 3 ? [get_random$1(cols), ...cols] : shuffle(cols);
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

  var chart = [
    [requirement_pie_random, display_pie_random],
    [requirement_bar, display_bar],
    [requirement_column, display_column]
  ];

  var patterns = [].concat(solid$1, dot$1, triangle, square$1, chart);

  const grid_dim_x = 40;
  const grid_dim_y = 40;
  const cell_scale = 20;

  const tile_scales = [1, 2, 3, 4, 5];

  const apparatus_generator = initialize_apparatus();
  const palette = get('empusa');

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
