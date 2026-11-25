// Keyboard and mouse: WASD or arrows to walk, E or Space to use a station,
// click anywhere to walk there, click a nearby station to use it, M to mute.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    left: false, right: false, up: false, down: false,
    interactQueued: false, muteQueued: false, anyKey: false,
    click: null, // { x, y } in view coordinates, consumed by the loop
  };

  const KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(event.code);
    input.anyKey = true;
    if (event.code === 'KeyE' || event.code === 'Space') input.interactQueued = true;
    if (event.code === 'KeyM') input.muteQueued = true;
    sync();
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
    sync();
  });
  window.addEventListener('blur', () => {
    keys.clear();
    sync();
  });

  function sync() {
    input.left = keys.has('ArrowLeft') || keys.has('KeyA');
    input.right = keys.has('ArrowRight') || keys.has('KeyD');
    input.up = keys.has('ArrowUp') || keys.has('KeyW');
    input.down = keys.has('ArrowDown') || keys.has('KeyS');
  }

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    input.click = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    input.anyKey = true;
  });

  return input;
}
