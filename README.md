[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/Erwinsays12/makefun-best-cooking-game/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/Erwinsays12/makefun-best-cooking-game/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

# Ember & Thyme — Rush Hour Kitchen

A complete, original cooking game for the [make.fun best cooking game bounty](https://make.fun/c/best-cooking-game-20261125-0137). Play it offline in a desktop browser: open `game/index.html` from any static server (or run `node serve.ts` and visit http://localhost:8080).

## How to play

You are the chef of a tiny kitchen at dinner rush. Orders land on the board with a countdown — chop, cook, plate and serve each dish before its ticket runs out.

- **Move:** WASD / arrow keys, or click anywhere to walk there
- **Use a station:** E or Space, or click a station when you are close
- **Mute:** M

Work the stations in order: grab ingredients from the crates, chop lettuce and tomato on the chopping board, fry patties and eggs on the stove (take them off before they burn!), stack the dish on the plating counter, then ring the bell at the serve window. Serving fast pays double; the dinner rush in the last 45 seconds pays double again, and quick serves in a row build a combo.

## Recipes

- **Sunny Burger** — bun + cooked patty + chopped lettuce + chopped tomato ($24)
- **Garden Melt** — bun + cheese + chopped tomato ($18)
- **Green Bowl** — chopped lettuce + chopped tomato + cheese ($16)
- **Sunny Skillet** — cooked egg + chopped tomato + cheese ($22)
- **Double Ember** — bun + two cooked patties + chopped lettuce + cheese ($34)

Survive the 150-second shift, earn stars for dishes served, and beat your best combo.

## Layout

- `game/` — the playable game, plain static files, no network requests: `index.html` plus ES modules under `src/` (`main.js` boot and loop, `config.js` recipes and kitchen layout, `state.js` orders and rules, `render.js` all canvas drawing, `input.js` keyboard and mouse, `audio.js` synthesized WebAudio sounds, `shots.js` staged screenshot scenes)
- `screenshots/` — 4 real renders of the game in the browser
- `main.ts` — the hand-in program that copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

All art is drawn in code and all sounds are synthesized — nothing is borrowed from any commercial game.
