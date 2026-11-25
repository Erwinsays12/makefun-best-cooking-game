// Boot and game loop: sizes the canvas, wires input and sound, runs the
// state update and the renderer. `?shot=<name>` freezes a staged scene for
// screenshots instead of starting a live game.
import { VIEW } from './config.js';
import { createInput } from './input.js';
import { createSfx } from './audio.js';
import {
  createGame, interact, nearestStation, updateGame,
  SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE,
} from './state.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number(params.get('seed') || '20261125');

const input = createInput(canvas);
const sfx = createSfx();
let game = createGame(Number.isFinite(seedParam) ? seedParam : 20261125);
let staged = false;
let time = 0;
let last = performance.now();

if (shotName) {
  const stagedShot = stageShot(shotName);
  game = stagedShot.game;
  staged = true;
}

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', fitCanvas);
fitCanvas();

function announce() {
  if (!statusEl) return;
  statusEl.textContent = game.screen === SCREEN_PLAY
    ? `Playing. ${game.orders.length} orders open, ${game.coins} coins, ${Math.ceil(game.timeLeft)} seconds left.`
    : game.screen === SCREEN_OVER
      ? `Shift over. ${game.served} dishes served, ${game.coins} coins.`
      : 'Ember and Thyme. Press any key to start.';
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;

  if (staged) {
    // A staged screenshot scene does not advance the clock.
    render(ctx, game, time, null);
    requestAnimationFrame(frame);
    return;
  }

  if (input.muteQueued) {
    input.muteQueued = false;
    sfx.toggleMute();
  }

  if (game.screen === SCREEN_TITLE && input.anyKey) {
    input.anyKey = false;
    sfx.unlock();
    game.screen = SCREEN_PLAY;
    announce();
  } else if (game.screen === SCREEN_OVER && (input.anyKey || input.click)) {
    const key = input.anyKey;
    input.anyKey = false;
    input.click = null;
    if (key) {
      game = createGame(game.seed + 1);
      game.screen = SCREEN_PLAY;
      announce();
    }
  }

  if (input.click && game.screen === SCREEN_PLAY) {
    const c = game.chef;
    const station = nearestStation(game);
    const dx = input.click.x - c.x;
    const dy = input.click.y - c.y;
    if (station && Math.hypot(dx, dy) < 130) {
      interact(game, sfx);
    } else {
      c.target = { x: input.click.x, y: Math.max(200, Math.min(660, input.click.y)) };
    }
    input.click = null;
  }

  if (input.interactQueued) {
    input.interactQueued = false;
    if (game.screen === SCREEN_PLAY) interact(game, sfx);
  }

  updateGame(game, dt, input, sfx);
  render(ctx, game, time, game.screen === SCREEN_PLAY ? nearestStation(game) : null);
  announce();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
