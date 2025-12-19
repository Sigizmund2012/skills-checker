// Простой скрипт для дополнительной интерактивности.
// Основные анимации появления реализованы через CSS.

/**
 * Лёгкое взаимодействие фона hero-секции с курсором.
 * Мы просто двигаем центр подсветки в radial-gradient
 * через CSS-переменные --hero-glow-x / --hero-glow-y.
 */
function initHeroBackgroundInteraction() {
  /** @type {HTMLElement | null} */
  const hero = document.querySelector(".hero");
  if (!hero) return;

  // Ограничиваем частоту обновления, чтобы не перегружать браузер.
  let frameRequested = false;
  let lastClientX = 0;
  let lastClientY = 0;

  function updateGlowPosition() {
    if (!hero) return;

    const rect = hero.getBoundingClientRect();

    // Нормализуем координаты курсора в проценты (0–100%).
    const x = ((lastClientX - rect.left) / rect.width) * 100;
    const y = ((lastClientY - rect.top) / rect.height) * 100;

    // Немного ограничим значения, чтобы подсветка не «убегала» слишком далеко.
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    hero.style.setProperty("--hero-glow-x", clampedX + "%");
    hero.style.setProperty("--hero-glow-y", clampedY + "%");

    frameRequested = false;
  }

  hero.addEventListener("mousemove", function (event) {
    /** @type {MouseEvent} */
    const e = event;
    lastClientX = e.clientX;
    lastClientY = e.clientY;

    if (!frameRequested) {
      frameRequested = true;
      globalThis.requestAnimationFrame(updateGlowPosition);
    }
  });

  // На тач-устройствах фон остаётся просто с автономной анимацией (без курсора).
}

document.addEventListener("DOMContentLoaded", function () {
  initHeroBackgroundInteraction();
});
