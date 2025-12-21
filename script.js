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

    // Ограничиваем значения, чтобы подсветка не «убегала» слишком далеко.
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    // Плавно обновляем позицию для более заметного эффекта
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
  initSkillsSection();
});

/**
 * Инициализация секции навыков
 */
function initSkillsSection() {
  const skillsGrid = document.getElementById("skillsGrid");
  const addSkillButton = document.getElementById("addSkillButton");

  if (!skillsGrid || !addSkillButton) return;

  // Загружаем навыки из localStorage при загрузке страницы
  loadSkillsFromStorage();

  // Обработчик клика на кнопку добавления навыка
  addSkillButton.addEventListener("click", function () {
    addNewSkill();
  });

  // Обработчик клика на карточки для разворачивания/сворачивания
  skillsGrid.addEventListener("click", function (event) {
    const card = event.target.closest(".skill-card");
    if (card) {
      toggleSkillCard(card);
    }
  });
}

/**
 * Добавление нового навыка через prompt()
 */
function addNewSkill() {
  const skillName = prompt("Введите название навыка:");
  if (!skillName || skillName.trim() === "") {
    return;
  }

  const skillDescription = prompt("Введите описание навыка:");
  if (!skillDescription || skillDescription.trim() === "") {
    return;
  }

  const skill = {
    id: Date.now().toString(),
    name: skillName.trim(),
    description: skillDescription.trim(),
  };

  // Добавляем навык в DOM
  createSkillCard(skill);

  // Сохраняем в localStorage
  saveSkillsToStorage();
}

/**
 * Создание карточки навыка
 */
function createSkillCard(skill) {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  const card = document.createElement("div");
  card.className = "skill-card";
  card.dataset.skillId = skill.id;

  card.innerHTML = `
    <h3>${escapeHtml(skill.name)}</h3>
    <p>${escapeHtml(skill.description)}</p>
  `;

  skillsGrid.appendChild(card);
}

/**
 * Разворачивание/сворачивание карточки навыка
 */
function toggleSkillCard(card) {
  card.classList.toggle("expanded");
  saveSkillsToStorage();
}

/**
 * Сохранение всех навыков в localStorage
 */
function saveSkillsToStorage() {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  const cards = skillsGrid.querySelectorAll(".skill-card");
  const skills = [];

  cards.forEach((card) => {
    const nameElement = card.querySelector("h3");
    const descriptionElement = card.querySelector("p");

    if (nameElement && descriptionElement) {
      skills.push({
        id: card.dataset.skillId,
        name: nameElement.textContent.trim(),
        description: descriptionElement.textContent.trim(),
        expanded: card.classList.contains("expanded"),
      });
    }
  });

  try {
    localStorage.setItem("skills", JSON.stringify(skills));
  } catch (error) {
    console.error("Ошибка при сохранении навыков:", error);
  }
}

/**
 * Загрузка навыков из localStorage
 */
function loadSkillsFromStorage() {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  try {
    const storedSkills = localStorage.getItem("skills");
    if (!storedSkills) {
      // Если навыков нет, можно добавить примеры или оставить пустым
      return;
    }

    const skills = JSON.parse(storedSkills);
    skillsGrid.innerHTML = "";

    skills.forEach((skill) => {
      const card = document.createElement("div");
      card.className = "skill-card";
      if (skill.expanded) {
        card.classList.add("expanded");
      }
      card.dataset.skillId = skill.id;

      card.innerHTML = `
        <h3>${escapeHtml(skill.name)}</h3>
        <p>${escapeHtml(skill.description)}</p>
      `;

      skillsGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Ошибка при загрузке навыков:", error);
  }
}

/**
 * Экранирование HTML для безопасности
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
