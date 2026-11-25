// Every pixel of Ember & Thyme is drawn here with canvas 2D: the kitchen,
// the order board, the stations, the chef, the food and the HUD. No images,
// no fonts from the network — shapes, emoji and system fonts only.
import { INGREDIENTS, RECIPES, RUSH_AT, STATIONS, VIEW } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './state.js';

const WALL = '#3d2b1f';
const FLOOR_A = '#c98f5f';
const FLOOR_B = '#bd8250';
const COUNTER_TOP = '#f3e2c7';
const COUNTER_SIDE = '#8a5a3b';
const BOARD_BG = '#2e2a26';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawIngredient(ctx, item, x, y, size) {
  const def = INGREDIENTS[item.kind];
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  if (item.state === 'burnt') {
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '🔥', 0, -s * 0.05, s * 0.5, '#fff');
    ctx.restore();
    return;
  }
  // A chopped ingredient is drawn cut open: tomato in two halves, lettuce
  // in shreds — never a cross mark, which reads as "wrong".
  if (item.state === 'chopped') {
    ctx.fillStyle = def.color;
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 3;
    if (item.kind === 'tomato') {
      ctx.beginPath();
      ctx.arc(-s * 0.16, 0, s * 0.28, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.16, 0, s * 0.28, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7bc96f';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(-s * 0.12, -s * 0.46);
      ctx.lineTo(s * 0.12, -s * 0.46);
      ctx.closePath();
      ctx.fill();
    } else {
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.ellipse(i * s * 0.3, (i % 2) * s * 0.08, s * 0.2, s * 0.16, i * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }
  ctx.fillStyle = def.color;
  ctx.strokeStyle = def.dark;
  ctx.lineWidth = 3;
  if (item.kind === 'bun') {
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.42, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f7d9a0';
    ctx.fillRect(-s * 0.38, s * 0.08, s * 0.76, s * 0.16);
    ctx.strokeRect(-s * 0.38, s * 0.08, s * 0.76, s * 0.16);
  } else if (item.kind === 'patty') {
    roundRect(ctx, -s * 0.45, -s * 0.22, s * 0.9, s * 0.44, s * 0.2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.arc(-s * 0.2, 0, s * 0.05, 0, Math.PI * 2);
    ctx.arc(s * 0.15, -s * 0.05, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    if (item.state === 'cooked') {
      ctx.strokeStyle = '#e8a94f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(-s * 0.15, -s * 0.45);
      ctx.moveTo(s * 0.1, -s * 0.32);
      ctx.lineTo(s * 0.25, -s * 0.48);
      ctx.stroke();
    }
  } else if (item.kind === 'lettuce') {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      ctx.ellipse(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2, s * 0.26, s * 0.2, a, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
  } else if (item.kind === 'tomato') {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7bc96f';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(-s * 0.16, -s * 0.55);
    ctx.lineTo(s * 0.16, -s * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (item.kind === 'cheese') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.25);
    ctx.lineTo(s * 0.42, s * 0.25);
    ctx.lineTo(s * 0.42, -s * 0.1);
    ctx.lineTo(0, -s * 0.38);
    ctx.lineTo(-s * 0.42, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.arc(-s * 0.12, s * 0.05, s * 0.06, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.05, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'egg') {
    ctx.fillStyle = '#fdfdfd';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s * 0.34, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8d28a';
    ctx.stroke();
    ctx.fillStyle = item.state === 'cooked' ? '#f7a928' : '#f7c948';
    ctx.beginPath();
    ctx.arc(s * 0.05, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStationBase(ctx, rect, label, highlight) {
  ctx.fillStyle = COUNTER_SIDE;
  roundRect(ctx, rect.x, rect.y + 8, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = COUNTER_TOP;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h - 6, 10);
  ctx.fill();
  if (highlight) {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 4;
    roundRect(ctx, rect.x - 3, rect.y - 3, rect.w + 6, rect.h, 12);
    ctx.stroke();
  }
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 14, 13, '#5a3a22');
}

function drawOrderTicket(ctx, order, x, y, w, h, index) {
  const urgent = order.timeLeft < 10;
  const flash = urgent && order.flash > 0.3;
  ctx.fillStyle = flash ? '#ffe3da' : '#fff8e7';
  ctx.strokeStyle = urgent ? '#e4572e' : '#8a5a3b';
  ctx.lineWidth = flash ? 3 : 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  text(ctx, `#${order.id} ${order.recipe.name}`, x + 10, y + 16, 15, '#3d2b1f', 'left');
  text(ctx, `$${order.recipe.price}`, x + w - 10, y + 16, 15, '#2e7d32', 'right');
  // ingredient icons in the order they must be stacked
  let ix = x + 22;
  for (const need of order.recipe.needs) {
    drawIngredient(ctx, { kind: need.kind, state: need.state }, ix, y + 46, 30);
    ix += 34;
  }
  // countdown bar
  const frac = Math.max(0, order.timeLeft / order.total);
  ctx.fillStyle = '#ddd';
  roundRect(ctx, x + 10, y + h - 18, w - 20, 9, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#4a9e3f' : frac > 0.25 ? '#f7a928' : '#e4572e';
  roundRect(ctx, x + 10, y + h - 18, (w - 20) * frac, 9, 4);
  ctx.fill();
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 12, y + h - 34, 13, urgent ? '#e4572e' : '#5a3a22', 'right');
  void index;
}

function drawChef(ctx, chef, time) {
  const bob = chef.moving ? Math.sin(time * 12) * 3 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.3);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (apron)
  ctx.fillStyle = '#f3ede0';
  roundRect(ctx, -16, -6, 32, 34, 10);
  ctx.fill();
  ctx.strokeStyle = '#c9b896';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e4572e';
  ctx.fillRect(-16, 8, 32, 6);
  // head + toque
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -18, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7, -30, 8, 0, Math.PI * 2);
  ctx.arc(0, -34, 9, 0, Math.PI * 2);
  ctx.arc(7, -30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-11, -30, 22, 6);
  // eyes face the walking direction
  ctx.fillStyle = '#2e2a26';
  ctx.beginPath();
  ctx.arc(chef.dir * 3 - 4, -18, 1.8, 0, Math.PI * 2);
  ctx.arc(chef.dir * 3 + 4, -18, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // arms; the front arm holds the carried ingredient up
  ctx.strokeStyle = '#f2c89b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(-22, 14 + bob);
  ctx.moveTo(14, 4);
  ctx.lineTo(22, 14 - bob);
  ctx.stroke();
  if (chef.carry) {
    drawIngredient(ctx, chef.carry, chef.dir * 4, -46, 44);
  }
  ctx.restore();
}

function drawKitchen(ctx, game, time, highlightStation) {
  // floor checker
  for (let ty = 0; ty < 6; ty += 1) {
    for (let tx = 0; tx < 16; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(tx * 80, 170 + ty * 90, 80, 90);
    }
  }
  // back wall + hanging pots
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, VIEW.width, 40);
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(0, 40, VIEW.width, 6);
  const pots = ['🍳', '🍲', '🥘'];
  pots.forEach((p, i) => text(ctx, p, 90 + i * 70, 22, 30, '#fff'));
  text(ctx, 'EMBER & THYME', 640, 22, 22, '#f7c948');
  text(ctx, 'RUSH HOUR KITCHEN', 1000, 22, 13, '#f3e2c7');

  // ---- order board (top) ----
  ctx.fillStyle = BOARD_BG;
  roundRect(ctx, 24, 56, 1232, 104, 12);
  ctx.fill();
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '📋 ORDER BOARD', 44, 76, 15, '#f7c948', 'left');
  if (game.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch crowd is coming…', 640, 115, 18, '#cfc4b4');
  }
  game.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, 200 + i * 258, 66, 244, 84, i);
  });

  // ---- stations ----
  for (const crate of STATIONS.crates) {
    const hl = highlightStation && highlightStation.name === 'crate' && highlightStation.kind === crate.kind;
    drawStationBase(ctx, crate, INGREDIENTS[crate.kind].name, hl);
    drawIngredient(ctx, { kind: crate.kind, state: 'raw' }, crate.x + crate.w / 2, crate.y + 44, 52);
    text(ctx, 'FREE', crate.x + crate.w / 2, crate.y + 84, 11, '#2e7d32');
  }
  const hlName = highlightStation ? highlightStation.name : null;
  drawStationBase(ctx, STATIONS.plates, '🍽 Plates', hlName === 'plates');
  text(ctx, 'take a plate', STATIONS.plates.x + 65, STATIONS.plates.y + 48, 13, '#5a3a22');
  drawStationBase(ctx, STATIONS.counter, '🍽 Plating Counter', hlName === 'counter');
  game.plate.forEach((item, i) => {
    drawIngredient(ctx, item, STATIONS.counter.x + 40 + i * 52, STATIONS.counter.y + 46, 46);
  });
  if (game.plate.length === 0) text(ctx, 'stack the dish here', STATIONS.counter.x + 165, STATIONS.counter.y + 48, 13, '#8a7a66');

  // chopping board
  drawStationBase(ctx, STATIONS.board, '🔪 Chopping Board', hlName === 'board');
  if (game.board.item) {
    drawIngredient(ctx, game.board.item, STATIONS.board.x + 75, STATIONS.board.y + 44, 52);
    const frac = game.board.progress / 1.4;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(STATIONS.board.x + 20, STATIONS.board.y + 78, 110, 8);
    ctx.fillStyle = '#f7a928';
    ctx.fillRect(STATIONS.board.x + 20, STATIONS.board.y + 78, 110 * Math.min(1, frac), 8);
    if (game.chopFx > 0) text(ctx, '✂', STATIONS.board.x + 75, STATIONS.board.y + 20, 26, '#fff');
  } else {
    text(ctx, 'chop here', STATIONS.board.x + 75, STATIONS.board.y + 44, 13, '#8a7a66');
  }

  // stove with two burners
  drawStationBase(ctx, STATIONS.stove, '🔥 Stove', hlName === 'stove');
  game.burners.forEach((slot, b) => {
    const bx = STATIONS.stove.x + 60 + b * 120;
    const by = STATIONS.stove.y + 44;
    ctx.fillStyle = '#2e2a26';
    ctx.beginPath();
    ctx.arc(bx, by, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = slot ? '#e4572e' : '#555';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (slot) {
      drawIngredient(ctx, slot.item, bx, by, 48);
      const total = slot.item.state === 'raw' ? 6 : 7;
      const frac = Math.min(1, slot.progress / total);
      ctx.strokeStyle = slot.item.burnt ? '#e4572e' : '#f7c948';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(bx, by, 42, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
      if (slot.item.state === 'cooked') text(ctx, 'READY!', bx, by - 52, 13, '#2e7d32');
      if (slot.item.burnt) text(ctx, 'BURNT!', bx, by - 52, 13, '#e4572e');
      if (game.sizzle > 0 && slot.item.state === 'raw') {
        text(ctx, '♨', bx + 26, by - 30, 20, '#fff');
      }
    }
  });

  // serve window + trash
  drawStationBase(ctx, STATIONS.serve, '🛎 Serve', hlName === 'serve');
  text(ctx, 'ring the bell', STATIONS.serve.x + 50, STATIONS.serve.y + 48, 12, '#5a3a22');
  drawStationBase(ctx, STATIONS.trash, '🗑 Trash', hlName === 'trash');
  text(ctx, 'toss it', STATIONS.trash.x + 50, STATIONS.trash.y + 48, 12, '#5a3a22');

  drawChef(ctx, game.chef, time);
}

function drawHud(ctx, game) {
  // bottom bar: timer, coins, served, combo, controls
  ctx.fillStyle = 'rgba(46,42,38,0.92)';
  ctx.fillRect(0, 686, VIEW.width, 34);
  const mins = Math.floor(game.timeLeft / 60);
  const secs = Math.floor(game.timeLeft % 60);
  const timerColor = game.timeLeft <= RUSH_AT ? '#ff8a65' : '#fff';
  text(ctx, `⏱ ${mins}:${String(secs).padStart(2, '0')}`, 90, 703, 20, timerColor);
  text(ctx, `🪙 ${game.coins} coins`, 260, 703, 18, '#f7c948');
  text(ctx, `🍽 Served ${game.served}   ✖ Missed ${game.failed}`, 470, 703, 18, '#fff');
  if (game.combo > 1) {
    text(ctx, `🔥 COMBO x${game.combo}`, 700, 703, 18, '#ff8a65');
  }
  if (game.rush) {
    text(ctx, '⚡ RUSH · 2x pay!', 880, 703, 15, '#ff8a65');
  }
  text(ctx, 'WASD move · E use · Click walk · M mute', 1150, 703, 13, '#cfc4b4', 'right');
  if (game.messageTimer > 0) {
    ctx.fillStyle = 'rgba(46,42,38,0.85)';
    roundRect(ctx, 390, 176, 500, 34, 8);
    ctx.fill();
    text(ctx, game.message, 640, 194, 16, '#ffd94d');
  }
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(30,20,12,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '🔥 EMBER & THYME 🔥', 640, 220, 54, '#f7c948');
  text(ctx, 'RUSH HOUR KITCHEN', 640, 272, 26, '#fff');
  text(ctx, 'Take orders from the board. Chop, cook, plate and serve', 640, 330, 20, '#f3e2c7');
  text(ctx, 'before the ticket timer runs out. Burnt food goes in the trash!', 640, 360, 20, '#f3e2c7');
  text(ctx, 'WASD / arrows to walk · E or Space to use a station · Click to walk there · M mute', 640, 410, 17, '#cfc4b4');
  text(ctx, '▶  Press any key or click to start the shift  ◀', 640, 470, 22, '#ffd94d');
  text(ctx, `Recipes: ${RECIPES.map((r) => r.name).join(' · ')}`, 640, 520, 15, '#cfc4b4');
  text(ctx, 'An original game — no borrowed characters, art or music.', 640, 560, 14, '#8a7a66');
  void game;
}

function drawOver(ctx, game) {
  ctx.fillStyle = 'rgba(30,20,12,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '🍽 SHIFT OVER 🍽', 640, 210, 48, '#f7c948');
  text(ctx, '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars), 640, 270, 40, '#ffd94d');
  text(ctx, `You served ${game.served} dishes and earned ${game.coins} coins`, 640, 330, 22, '#fff');
  text(ctx, `Best combo x${game.bestCombo} · ${game.failed} orders walked out`, 640, 366, 18, '#cfc4b4');
  const verdict = game.stars === 3
    ? 'Head Chef! The dining room is yours.'
    : game.stars === 2
      ? 'Sous Chef — the rush nearly had you.'
      : game.stars === 1
        ? 'Line Cook — keep those tickets moving!'
        : 'The tickets won this shift. One more go?';
  text(ctx, verdict, 640, 410, 20, '#ffd94d');
  text(ctx, 'Press any key to cook another shift', 640, 470, 18, '#fff');
}

export function render(ctx, game, time, highlightStation) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawKitchen(ctx, game, time, highlightStation);
  if (game.screen === SCREEN_PLAY || game.screen === SCREEN_OVER) drawHud(ctx, game);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx, game);
  if (game.screen === SCREEN_OVER) drawOver(ctx, game);
}
