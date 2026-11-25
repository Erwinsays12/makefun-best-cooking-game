// Ember & Thyme — Rush Hour Kitchen: every tunable number, recipe and station
// of the game lives here, so the rules of the kitchen can be read in one place.
export const VIEW = { width: 1280, height: 720 };

export const DAY_SECONDS = 150;
export const RUSH_AT = 45; // seconds left when the dinner rush begins
export const ORDER_TIME = 55; // seconds an order stays on the board
export const RUSH_ORDER_TIME = 38;
export const MAX_ORDERS = 4;
export const COMBO_WINDOW = 20; // seconds a serve keeps the combo alive

// An ingredient's journey: raw -> chopped (board) -> cooked (stove, some only)
// -> on a plate -> served. `needs` says which step each one requires.
export const INGREDIENTS = {
  bun:     { name: 'Bun',     color: '#e8a94f', dark: '#b97a28', chop: false, cook: false, emoji: '🍞' },
  patty:   { name: 'Patty',   color: '#8a5a3b', dark: '#5f3a22', chop: false, cook: true,  emoji: '🥩' },
  lettuce: { name: 'Lettuce', color: '#7bc96f', dark: '#4a9e3f', chop: true,  cook: false, emoji: '🥬' },
  tomato:  { name: 'Tomato',  color: '#e4572e', dark: '#b23a1a', chop: true,  cook: false, emoji: '🍅' },
  cheese:  { name: 'Cheese',  color: '#f7c948', dark: '#d9a41f', chop: false, cook: false, emoji: '🧀' },
  egg:     { name: 'Egg',     color: '#fdf3d0', dark: '#e8d28a', chop: false, cook: true,  emoji: '🥚' },
};

export const RECIPES = [
  {
    id: 'sunny-burger', name: 'Sunny Burger', price: 24,
    needs: [
      { kind: 'bun', state: 'raw' },
      { kind: 'patty', state: 'cooked' },
      { kind: 'lettuce', state: 'chopped' },
      { kind: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'garden-melt', name: 'Garden Melt', price: 18,
    needs: [
      { kind: 'bun', state: 'raw' },
      { kind: 'cheese', state: 'raw' },
      { kind: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'green-bowl', name: 'Green Bowl', price: 16,
    needs: [
      { kind: 'lettuce', state: 'chopped' },
      { kind: 'tomato', state: 'chopped' },
      { kind: 'cheese', state: 'raw' },
    ],
  },
  {
    id: 'sunny-skillet', name: 'Sunny Skillet', price: 22,
    needs: [
      { kind: 'egg', state: 'cooked' },
      { kind: 'tomato', state: 'chopped' },
      { kind: 'cheese', state: 'raw' },
    ],
  },
  {
    id: 'double-ember', name: 'Double Ember', price: 34,
    needs: [
      { kind: 'bun', state: 'raw' },
      { kind: 'patty', state: 'cooked' },
      { kind: 'patty', state: 'cooked' },
      { kind: 'lettuce', state: 'chopped' },
      { kind: 'cheese', state: 'raw' },
    ],
  },
];

// Kitchen floor plan. Every station is a rectangle the chef walks up to;
// `use` is what the interact key does there.
export const STATIONS = {
  crates: [
    { kind: 'bun', x: 40, y: 560, w: 110, h: 110 },
    { kind: 'patty', x: 165, y: 560, w: 110, h: 110 },
    { kind: 'lettuce', x: 290, y: 560, w: 110, h: 110 },
    { kind: 'tomato', x: 415, y: 560, w: 110, h: 110 },
    { kind: 'cheese', x: 540, y: 560, w: 110, h: 110 },
    { kind: 'egg', x: 665, y: 560, w: 110, h: 110 },
  ],
  board: { x: 830, y: 560, w: 150, h: 110, label: 'Chopping Board' },
  stove: { x: 1000, y: 560, w: 240, h: 110, label: 'Stove', burners: 2 },
  plates: { x: 40, y: 400, w: 130, h: 110, label: 'Plates' },
  counter: { x: 200, y: 400, w: 330, h: 110, label: 'Plating Counter' },
  serve: { x: 1140, y: 400, w: 100, h: 110, label: 'Serve Window' },
  trash: { x: 560, y: 400, w: 110, h: 110, label: 'Trash' },
};

export const CHEF = { speed: 260, radius: 24 };
export const CHOP_SECONDS = 1.4;
export const COOK_SECONDS = 6;
export const BURN_SECONDS = 13; // cooked food left on the burner burns after this
export const SERVE_BONUS_SECONDS = 12; // serving with this much order time left pays double
