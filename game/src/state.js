// Game state: orders on the board, the chef's hands, the board, the burners,
// the plating counter and the day clock. Pure data plus the rules that move it.
import {
  CHEF, CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS, COMBO_WINDOW,
  DAY_SECONDS, INGREDIENTS, MAX_ORDERS, ORDER_TIME, RECIPES,
  RUSH_AT, RUSH_ORDER_TIME, SERVE_BONUS_SECONDS, STATIONS,
} from './config.js';
import { mulberry32, pick } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_FAILED = 2;
export const EVENT_OVER = 4;

let orderId = 1;

export function makeItem(kind, state = 'raw') {
  return { kind, state, cook: 0, chop: 0, burnt: false };
}

export function createGame(seed = 20261125) {
  return {
    seed,
    rng: mulberry32(seed),
    screen: SCREEN_TITLE,
    timeLeft: DAY_SECONDS,
    elapsed: 0,
    spawnTimer: 1.2,
    orders: [],
    chef: { x: 640, y: 330, dir: 1, moving: false, carry: null, target: null },
    board: { item: null, progress: 0 },
    burners: [null, null], // { item, progress } per burner
    plate: [], // items stacked on the plating counter
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    rush: false,
    rushAnnounced: false,
    message: '',
    messageTimer: 0,
    sizzle: 0,
    chopFx: 0,
    stars: 0,
  };
}

function recipeFor(rng, elapsed) {
  // Double Ember only appears once the kitchen is warm.
  const pool = elapsed > 60 ? RECIPES : RECIPES.filter((r) => r.id !== 'double-ember');
  return pick(rng, pool);
}

export function spawnOrder(game) {
  if (game.orders.length >= MAX_ORDERS) return;
  const recipe = recipeFor(game.rng, game.elapsed);
  const time = game.rush ? RUSH_ORDER_TIME : ORDER_TIME;
  game.orders.push({
    id: orderId++,
    recipe,
    timeLeft: time,
    total: time,
    flash: 0,
  });
}

function plateMatchesOrder(plate, recipe) {
  const wanted = recipe.needs.map((n) => `${n.kind}:${n.state}`).sort();
  const have = plate.map((i) => `${i.kind}:${i.state}`).sort();
  if (wanted.length !== have.length) return false;
  return wanted.every((w, i) => w === have[i]);
}

function missingFor(plate, recipe) {
  const have = plate.map((i) => `${i.kind}:${i.state}`);
  const missing = [];
  for (const need of recipe.needs) {
    const key = `${need.kind}:${need.state}`;
    const at = have.indexOf(key);
    if (at >= 0) have.splice(at, 1);
    else missing.push(need);
  }
  return missing;
}

export function plateFitsOrder(plate, recipe) {
  return missingFor(plate, recipe).length === recipe.needs.length - plate.length
    && plate.length < recipe.needs.length
    && missingFor(plate, recipe).length + plate.length === recipe.needs.length;
}

export function updateGame(game, dt, input, sfx) {
  if (game.screen !== SCREEN_PLAY) return EVENT_NONE;
  let events = EVENT_NONE;
  game.elapsed += dt;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_OVER;
    game.stars = game.served >= 14 ? 3 : game.served >= 9 ? 2 : game.served >= 5 ? 1 : 0;
    return EVENT_OVER;
  }
  if (!game.rush && game.timeLeft <= RUSH_AT) {
    game.rush = true;
    game.rushAnnounced = true;
    game.message = 'DINNER RUSH! Orders pay double!';
    game.messageTimer = 3;
    sfx.rush();
  }
  if (game.messageTimer > 0) game.messageTimer -= dt;
  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;
  }
  if (game.sizzle > 0) game.sizzle -= dt;
  if (game.chopFx > 0) game.chopFx -= dt;

  // Orders tick down; an expired order is lost.
  for (let i = game.orders.length - 1; i >= 0; i -= 1) {
    const order = game.orders[i];
    order.timeLeft -= dt;
    order.flash = order.timeLeft < 10 ? (order.flash + dt) % 0.6 : 0;
    if (order.timeLeft <= 0) {
      game.orders.splice(i, 1);
      game.failed += 1;
      game.combo = 0;
      game.message = `${order.recipe.name} walked out!`;
      game.messageTimer = 2;
      sfx.fail();
      events |= EVENT_FAILED;
    }
  }

  // New orders arrive; the rush deals them faster.
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnOrder(game);
    game.spawnTimer = game.rush ? 7 : 11;
  }

  // Chopping finishes on the board.
  if (game.board.item && INGREDIENTS[game.board.item.kind].chop) {
    game.board.progress += dt;
    if (game.board.progress >= CHOP_SECONDS) {
      game.board.item.state = 'chopped';
      game.board.progress = 0;
      game.chopFx = 0.4;
      sfx.chop();
    }
  }

  // Burners cook, then burn.
  for (let b = 0; b < game.burners.length; b += 1) {
    const slot = game.burners[b];
    if (!slot) continue;
    slot.progress += dt;
    if (slot.item.state === 'raw' && slot.progress >= COOK_SECONDS) {
      slot.item.state = 'cooked';
      slot.progress = 0;
      sfx.ding();
    } else if (slot.item.state === 'cooked' && slot.progress >= BURN_SECONDS - COOK_SECONDS) {
      slot.item.burnt = true;
      slot.item.state = 'burnt';
      sfx.fail();
    }
  }

  moveChef(game, dt, input);
  return events;
}

function clampChef(game) {
  const c = game.chef;
  c.x = Math.max(70, Math.min(1210, c.x));
  c.y = Math.max(200, Math.min(660, c.y));
}

function moveChef(game, dt, input) {
  const c = game.chef;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (dx !== 0 || dy !== 0) {
    c.target = null;
    const len = Math.hypot(dx, dy);
    c.x += (dx / len) * CHEF.speed * dt;
    c.y += (dy / len) * CHEF.speed * dt;
    c.dir = dx !== 0 ? Math.sign(dx) : c.dir;
    c.moving = true;
  } else if (c.target) {
    const tx = c.target.x - c.x;
    const ty = c.target.y - c.y;
    const dist = Math.hypot(tx, ty);
    if (dist < 6) {
      c.target = null;
      c.moving = false;
    } else {
      c.x += (tx / dist) * CHEF.speed * dt;
      c.y += (ty / dist) * CHEF.speed * dt;
      c.dir = tx !== 0 ? Math.sign(tx) : c.dir;
      c.moving = true;
    }
  } else {
    c.moving = false;
  }
  clampChef(game);
}

export function nearestStation(game) {
  const c = game.chef;
  const cx = c.x;
  const cy = c.y;
  let best = null;
  let bestD = 110;
  const consider = (name, rect, extra = {}) => {
    const x = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const y = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const d = Math.hypot(cx - x, cy - y);
    if (d < bestD) {
      bestD = d;
      best = { name, rect, ...extra };
    }
  };
  for (const crate of STATIONS.crates) consider('crate', crate, { kind: crate.kind });
  consider('board', STATIONS.board);
  consider('stove', STATIONS.stove);
  consider('plates', STATIONS.plates);
  consider('counter', STATIONS.counter);
  consider('serve', STATIONS.serve);
  consider('trash', STATIONS.trash);
  return best;
}

// The interact key (E / Space / click): pick up, place, chop, cook, plate, serve.
export function interact(game, sfx) {
  if (game.screen !== SCREEN_PLAY) return;
  const station = nearestStation(game);
  if (!station) {
    game.message = 'Walk up to a station first!';
    game.messageTimer = 1.2;
    return;
  }
  const chef = game.chef;

  if (station.name === 'crate') {
    if (chef.carry) {
      game.message = 'Hands full!';
      game.messageTimer = 1;
      return;
    }
    chef.carry = makeItem(station.kind);
    sfx.pickup();
    return;
  }

  if (station.name === 'trash') {
    if (chef.carry) {
      chef.carry = null;
      sfx.trash();
    }
    return;
  }

  if (station.name === 'board') {
    if (!game.board.item && chef.carry && INGREDIENTS[chef.carry.kind].chop && chef.carry.state === 'raw') {
      game.board.item = chef.carry;
      game.board.progress = 0;
      chef.carry = null;
      sfx.place();
    } else if (game.board.item && !chef.carry) {
      chef.carry = game.board.item;
      game.board.item = null;
      game.board.progress = 0;
      sfx.pickup();
    } else if (game.board.item) {
      game.message = 'It is still chopping — wait for the ding!';
      game.messageTimer = 1.2;
    } else if (chef.carry) {
      game.message = `${INGREDIENTS[chef.carry.kind].name} needs no chopping.`;
      game.messageTimer = 1.2;
    }
    return;
  }

  if (station.name === 'stove') {
    if (chef.carry && INGREDIENTS[chef.carry.kind].cook && chef.carry.state === 'raw') {
      const free = game.burners.findIndex((b) => b === null);
      if (free >= 0) {
        game.burners[free] = { item: chef.carry, progress: 0 };
        chef.carry = null;
        game.sizzle = 1;
        sfx.sizzle();
      } else {
        game.message = 'Both burners are full!';
        game.messageTimer = 1.2;
      }
    } else if (!chef.carry) {
      const done = game.burners.findIndex((b) => b && b.item.state !== 'raw');
      if (done >= 0) {
        chef.carry = game.burners[done].item;
        game.burners[done] = null;
        sfx.pickup();
      } else if (game.burners.some((b) => b)) {
        game.message = 'Still cooking — watch the ring fill!';
        game.messageTimer = 1.2;
      }
    } else {
      game.message = `${INGREDIENTS[chef.carry.kind].name} goes on no burner.`;
      game.messageTimer = 1.2;
    }
    return;
  }

  if (station.name === 'plates') {
    if (!chef.carry && game.plate.length === 0) {
      game.message = 'Grab ingredients, then stack them on the plating counter.';
      game.messageTimer = 1.5;
    }
    return;
  }

  if (station.name === 'counter') {
    if (chef.carry && chef.carry.state !== 'burnt') {
      const fits = game.orders.some((o) => plateFitsOrder([...game.plate, chef.carry], o.recipe));
      if (game.plate.length === 0 || fits || game.orders.length === 0) {
        game.plate.push(chef.carry);
        chef.carry = null;
        sfx.place();
      } else {
        game.message = 'No open order wants that on this plate!';
        game.messageTimer = 1.5;
        sfx.fail();
      }
    } else if (!chef.carry && game.plate.length > 0) {
      chef.carry = game.plate.pop();
      sfx.pickup();
    } else if (chef.carry && chef.carry.state === 'burnt') {
      game.message = 'Burnt! Toss it in the trash.';
      game.messageTimer = 1.2;
    }
    return;
  }

  if (station.name === 'serve') {
    if (game.plate.length === 0) {
      game.message = 'Nothing plated yet — build a dish on the counter!';
      game.messageTimer = 1.5;
      return;
    }
    const match = game.orders.find((o) => plateMatchesOrder(game.plate, o.recipe));
    if (!match) {
      game.message = 'That plate matches no order. Check the board!';
      game.messageTimer = 1.8;
      sfx.fail();
      return;
    }
    const rushPay = game.rush ? 2 : 1;
    const fastPay = match.timeLeft > SERVE_BONUS_SECONDS ? 2 : 1;
    const pay = match.recipe.price * rushPay * fastPay;
    game.coins += pay;
    game.served += 1;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    game.comboTimer = COMBO_WINDOW;
    game.coins += (game.combo - 1) * 2;
    game.orders.splice(game.orders.indexOf(match), 1);
    game.plate = [];
    game.message = `Served ${match.recipe.name}! +${pay} coins${game.combo > 1 ? `  Combo x${game.combo}!` : ''}`;
    game.messageTimer = 2.2;
    sfx.serve();
  }
}
