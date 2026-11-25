// Screenshot scenes: each one sets up a real game state with the same rules
// a player would reach — orders on the board, a dish mid-assembly, a plate
// ready to serve — then the normal renderer draws it. No fake pixels.
import { RECIPES } from './config.js';
import { createGame, makeItem, SCREEN_PLAY, SCREEN_OVER, spawnOrder } from './state.js';

function orderWith(game, recipeId, timeLeft) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const order = { id: 0, recipe, timeLeft, total: 55, flash: 0 };
  return order;
}

function baseScene(seed) {
  const game = createGame(seed);
  game.screen = SCREEN_PLAY;
  game.elapsed = 40;
  game.timeLeft = 132;
  game.coins = 48;
  game.served = 3;
  game.combo = 2;
  game.comboTimer = 12;
  return game;
}

function stageCover() {
  const game = baseScene(7);
  // Three tickets on the board, one nearly out of time.
  game.orders = [
    orderWith(game, 'sunny-burger', 41),
    orderWith(game, 'garden-melt', 22),
    orderWith(game, 'sunny-skillet', 8),
  ];
  game.orders.forEach((o, i) => { o.id = i + 1; o.flash = o.timeLeft < 10 ? 0.4 : 0; });
  // Chef at the chopping board mid-chop, holding nothing; tomato half chopped.
  game.chef.x = 880;
  game.chef.y = 500;
  game.chef.dir = 1;
  game.board.item = makeItem('tomato', 'chopped');
  game.board.progress = 0.9;
  // A patty sizzling on the stove.
  game.burners[0] = { item: makeItem('patty', 'raw'), progress: 4.2 };
  // A plate on the counter mid-assembly: bun + cooked patty, lettuce still to go.
  game.plate = [makeItem('bun'), makeItem('patty', 'cooked')];
  // And a finished Garden Melt plated at the serve side of the counter.
  game.plate.push(makeItem('cheese'));
  return { game, screen: SCREEN_PLAY };
}

function stagePlay() {
  const game = baseScene(21);
  game.orders = [orderWith(game, 'sunny-skillet', 34), orderWith(game, 'double-ember', 48)];
  game.orders.forEach((o, i) => { o.id = i + 1; });
  game.chef.x = 1060;
  game.chef.y = 500;
  game.chef.dir = -1;
  game.chef.carry = makeItem('egg', 'cooked');
  game.burners[0] = { item: makeItem('patty', 'cooked'), progress: 0.5 };
  game.burners[1] = { item: makeItem('egg', 'raw'), progress: 2.5 };
  game.sizzle = 0.8;
  game.plate = [makeItem('tomato', 'chopped'), makeItem('cheese')];
  game.message = 'Egg is cooked — plate it!';
  game.messageTimer = 2;
  return { game, screen: SCREEN_PLAY };
}

function stageRush() {
  const game = baseScene(33);
  game.timeLeft = 38;
  game.rush = true;
  game.elapsed = 112;
  game.coins = 126;
  game.served = 8;
  game.combo = 4;
  game.comboTimer = 15;
  game.orders = [
    orderWith(game, 'double-ember', 30),
    orderWith(game, 'sunny-burger', 18),
    orderWith(game, 'green-bowl', 9),
    orderWith(game, 'garden-melt', 25),
  ];
  game.orders.forEach((o, i) => { o.id = i + 1; o.flash = o.timeLeft < 10 ? 0.4 : 0; });
  game.chef.x = 700;
  game.chef.y = 500;
  game.chef.dir = 1;
  game.chef.carry = makeItem('lettuce', 'chopped');
  game.board.item = makeItem('tomato', 'raw');
  game.board.progress = 0.7;
  game.burners[0] = { item: makeItem('patty', 'cooked'), progress: 1 };
  game.burners[1] = { item: makeItem('patty', 'raw'), progress: 5.1 };
  game.plate = [makeItem('bun'), makeItem('patty', 'cooked'), makeItem('cheese')];
  game.message = 'DINNER RUSH! Orders pay double!';
  game.messageTimer = 2.5;
  return { game, screen: SCREEN_PLAY };
}

function stageEnd() {
  const game = baseScene(55);
  game.screen = SCREEN_OVER;
  game.timeLeft = 0;
  game.served = 11;
  game.coins = 214;
  game.bestCombo = 5;
  game.failed = 2;
  game.stars = 2;
  game.orders = [orderWith(game, 'sunny-burger', 12)];
  game.orders[0].id = 1;
  game.chef.x = 1200;
  game.chef.y = 660;
  return { game, screen: SCREEN_OVER };
}

// `name` comes from ?shot=cover|play|rush|end (anything else is the cover).
export function stageShot(name) {
  if (name === 'play') return stagePlay();
  if (name === 'rush') return stageRush();
  if (name === 'end') return stageEnd();
  return stageCover();
}

export { spawnOrder };
