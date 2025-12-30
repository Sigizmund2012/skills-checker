// Простой скрипт для дополнительной интерактивности.
// Основные анимации появления реализованы через CSS.

/**
 * Лёгкое взаимодействие фона body с курсором.
 * Мы просто двигаем центр подсветки в radial-gradient
 * через CSS-переменные --body-glow-x / --body-glow-y.
 */
function initBodyBackgroundInteraction() {
  const body = document.body;

  // Ограничиваем частоту обновления, чтобы не перегружать браузер.
  let frameRequested = false;
  let lastClientX = 0;
  let lastClientY = 0;

  function updateGlowPosition() {
    // Нормализуем координаты курсора в проценты (0–100%) относительно viewport.
    const x = (lastClientX / window.innerWidth) * 100;
    const y = (lastClientY / window.innerHeight) * 100;

    // Ограничиваем значения, чтобы подсветка не «убегала» слишком далеко.
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    // Плавно обновляем позицию для более заметного эффекта
    body.style.setProperty("--body-glow-x", clampedX + "%");
    body.style.setProperty("--body-glow-y", clampedY + "%");

    frameRequested = false;
  }

  document.addEventListener("mousemove", function (event) {
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
  initBodyBackgroundInteraction();
  initSkillsSection();
  initSkillsIndex();
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
    // Если клик по кнопке удаления, или отметки, то не разворачиваем карточку
    if (
      event.target.closest(".delete-skill-button") ||
      event.target.closest(".mark-learned-button")
    ) {
      return;
    }

    const card = event.target.closest(".skill-card");
    if (card) {
      toggleSkillCard(card);
    }
  });

  // Обработчик клика на кнопку удаления
  skillsGrid.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".delete-skill-button");
    if (deleteButton) {
      const card = deleteButton.closest(".skill-card");
      if (card) {
        deleteSkill(card);
      }
    }
  });

  // Обработчик клика на кнопку отметки навыка как изученного
  skillsGrid.addEventListener("click", function (event) {
    const markLearnedButton = event.target.closest(".mark-learned-button");
    if (markLearnedButton) {
      const card = markLearnedButton.closest(".skill-card");
      if (card) {
        toggleLearnedStatus(card);
      }
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

  // Добавляем навык в индекс навыков
  addSkillToIndex(skillName.trim());

  // Сохраняем в localStorage
  saveSkillsToStorage();
}

/**
 * Добавление навыка в индекс навыков
 */
function addSkillToIndex(skillName) {
  const skillsIndexContainer = document.querySelector(".skills-index-sliders");
  if (!skillsIndexContainer) return;

  // Проверяем, существует ли уже такой слайдер
  const existingSlider = document.querySelector(
    `.skill-slider[data-skill="${skillName}"]`
  );
  if (existingSlider) return;

  // Создаем новый слайдер для навыка
  const skillId = skillName.toLowerCase().replaceAll(/\s+/g, "-") + "-slider";
  const localStorageData = JSON.parse(localStorage.getItem("skillsIndex"));
  const skillSliderValue = localStorageData[skillName]
    ? localStorageData[skillName]
    : 0;
  const sliderHTML = `
    <div class="skill-slider" data-skill="${skillName}">
      <label for="${skillId}">${skillName}</label>
      <input
        type="range"
        id="${skillId}"
        min="0"
        max="100"
        value=${skillSliderValue}
        class="skill-range"
      />
      <span class="skill-value">${skillSliderValue}%</span>
    </div>
  `;

  skillsIndexContainer.insertAdjacentHTML("beforeend", sliderHTML);

  // Добавляем обработчик для нового слайдера
  const newRange = document.getElementById(skillId);
  newRange.addEventListener("input", function () {
    updateSkillValue(this);
    updateAverageValue();
    saveSkillsIndexToStorage();
  });

  // Обновляем среднее значение
  updateAverageValue();

  // Сохраняем обновленный индекс навыков
  saveSkillsIndexToStorage();
}

/**
 * Создание карточки навыка
 */
function createSkillCard(skill) {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  const card = document.createElement("div");
  card.className = "skill-card";
  if (skill.learned) {
    card.classList.add("learned");
  }
  card.dataset.skillId = skill.id;

  card.innerHTML = `
  <button class="mark-learned-button" aria-label="Отметить как изученный">✓</button>
    <button class="delete-skill-button" aria-label="Удалить навык">×</button>
    <h3>${escapeHtml(skill.name)}</h3>
    <p>${escapeHtml(skill.description)}</p>
  `;

  skillsGrid.appendChild(card);
}

/**
 * Переключение состояния "изученный" для навыка
 */
function toggleLearnedStatus(card) {
  card.classList.toggle("learned");

  // Get the skill name from the card
  const nameElement = card.querySelector("h3");
  if (nameElement) {
    const skillName = nameElement.textContent.trim();

    // Find the corresponding slider
    const skillSlider = document.querySelector(
      `.skill-slider[data-skill="${skillName}"]`
    );
    if (skillSlider) {
      const rangeInput = skillSlider.querySelector(".skill-range");
      if (rangeInput) {
        // Set slider value based on learned status
        const newValue = card.classList.contains("learned") ? 100 : 0;
        rangeInput.value = newValue;

        // Update the display value
        const valueDisplay = rangeInput.nextElementSibling;
        if (valueDisplay?.classList.contains("skill-value")) {
          valueDisplay.textContent = newValue + "%";
        }

        // Update average and save to storage
        updateAverageValue();
        saveSkillsIndexToStorage();
      }
    }
  }

  saveSkillsToStorage();
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
        learned: card.classList.contains("learned"),
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
      // Если навыков нет, добавляем демо-данные из индекса навыков
      addDemoSkillsFromIndex();
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
      if (skill.learned) {
        card.classList.add("learned");
      }
      card.dataset.skillId = skill.id;

      card.innerHTML = `
        <button class="mark-learned-button" aria-label="Отметить как изученный">✓</button>
        <button class="delete-skill-button" aria-label="Удалить навык"><span>x</span></button>
        <h3>${escapeHtml(skill.name)}</h3>
        <p>${escapeHtml(skill.description)}</p>
      `;

      skillsGrid.appendChild(card);

      // Убедимся, что для каждого навыка есть слайдер в индексе
      addSkillToIndex(skill.name);

      // Синхронизируем слайдер с состоянием "изученный"
      if (skill.learned) {
        const skillSlider = document.querySelector(
          `.skill-slider[data-skill="${skill.name}"]`
        );
        if (skillSlider) {
          const rangeInput = skillSlider.querySelector(".skill-range");
          if (rangeInput) {
            rangeInput.value = 100;
            const valueDisplay = rangeInput.nextElementSibling;
            if (valueDisplay?.classList.contains("skill-value")) {
              valueDisplay.textContent = "100%";
            }
          }
        }
      }
    });

    // Обновляем среднее значение после загрузки всех навыков
    updateAverageValue();
  } catch (error) {
    console.error("Ошибка при загрузке навыков:", error);
  }
}

/**
 * Добавление демо-данных из индекса навыков
 */
function addDemoSkillsFromIndex() {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  // Создаем демо-данные для навыков
  const demoSkillNames = ["HTML", "CSS", "JavaScript", "React/Vue"];
  const demoSkillDescriptions = {
    HTML: "Язык разметки для создания структуры веб-страниц",
    CSS: "Язык стилей для оформления веб-страниц",
    JavaScript: "Язык программирования для добавления интерактивности",
    "React/Vue":
      "Популярные фреймворки для создания пользовательских интерфейсов",
  };

  const demoSkills = [];

  demoSkillNames.forEach((name, index) => {
    demoSkills.push({
      id: Date.now().toString() + index,
      name: name,
      description: demoSkillDescriptions[name],
      learned: index < 2, // Отмечаем первые два навыка как изученные
    });

    // Убедимся, что для каждого навыка есть слайдер в индексе
    addSkillToIndex(name);
  });

  // Создаем карточки для демо-навыков
  demoSkills.forEach((skill) => {
    createSkillCard(skill);

    // Синхронизируем слайдер с состоянием "изученный" для демо-навыков
    if (skill.learned) {
      const skillSlider = document.querySelector(
        `.skill-slider[data-skill="${skill.name}"]`
      );
      if (skillSlider) {
        const rangeInput = skillSlider.querySelector(".skill-range");
        if (rangeInput) {
          rangeInput.value = 100;
          const valueDisplay = rangeInput.nextElementSibling;
          if (valueDisplay?.classList.contains("skill-value")) {
            valueDisplay.textContent = "100%";
          }
        }
      }
    }
  });

  // Обновляем среднее значение после добавления всех слайдеров
  updateAverageValue();

  // Сохраняем демо-данные в localStorage
  saveSkillsToStorage();
}

/**
 * Удаление навыка с подтверждением
 */
function deleteSkill(card) {
  const nameElement = card.querySelector("h3");
  const skillName = nameElement ? nameElement.textContent.trim() : "этот навык";

  const confirmed = confirm(
    `Вы уверены, что хотите удалить навык "${skillName}"?`
  );

  if (confirmed) {
    card.style.transition = "all 0.3s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";

    setTimeout(() => {
      card.remove();
      saveSkillsToStorage();

      // Также удаляем соответствующий слайдер из индекса навыков
      removeSkillFromIndex(skillName);
    }, 300);
  }
}

/**
 * Удаление навыка из индекса навыков
 */
function removeSkillFromIndex(skillName) {
  const skillSlider = document.querySelector(
    `.skill-slider[data-skill="${skillName}"]`
  );
  if (skillSlider) {
    skillSlider.remove();

    // Обновляем среднее значение
    updateAverageValue();

    // Сохраняем обновленный индекс навыков
    saveSkillsIndexToStorage();
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

/**
 * Инициализация секции индекса навыков
 */
function initSkillsIndex() {
  const averageValue = document.getElementById("averageValue");
  const levelDescription = document.getElementById("levelDescription");
  const progressFill = document.getElementById("progressFill");

  if (!averageValue || !levelDescription || !progressFill) return;

  // Восстанавливаем динамические слайдеры перед инициализацией
  restoreDynamicSliders();

  // Теперь получаем все слайдеры (включая динамические)
  const skillRanges = document.querySelectorAll(".skill-range");

  if (!skillRanges.length) return;

  // Загружаем сохраненные значения из localStorage
  loadSkillsIndexFromStorage();

  // Обработчик изменения слайдеров
  skillRanges.forEach((range) => {
    range.addEventListener("input", function () {
      updateSkillValue(this);
      updateAverageValue();
      saveSkillsIndexToStorage();
    });
  });

  // Инициализируем отображение значений
  skillRanges.forEach((range) => {
    updateSkillValue(range);
  });

  // Рассчитываем среднее значение
  updateAverageValue();
}

/**
 * Восстановление динамических слайдеров из localStorage
 */
function restoreDynamicSliders() {
  const skillsIndexContainer = document.querySelector(".skills-index-sliders");
  if (!skillsIndexContainer) return;

  try {
    // Получаем сохраненные навыки
    const storedSkills = localStorage.getItem("skills");
    if (!storedSkills) return;

    const skills = JSON.parse(storedSkills);

    // Получаем текущие слайдеры
    const existingSliders = document.querySelectorAll(".skill-slider");
    const existingSkillNames = new Set(
      Array.from(existingSliders).map((slider) => slider.dataset.skill)
    );

    // Для каждого навыка, если нет соответствующего слайдера, создаем его
    skills.forEach((skill) => {
      if (!existingSkillNames.has(skill.name)) {
        addSkillToIndex(skill.name);
      }
    });
  } catch (error) {
    console.error("Ошибка при восстановлении динамических слайдеров:", error);
  }
}

/**
 * Обновление отображаемого значения для слайдера
 */
function updateSkillValue(range) {
  const valueDisplay = range.nextElementSibling;
  if (valueDisplay?.classList.contains("skill-value")) {
    valueDisplay.textContent = range.value + "%";
  }
}

/**
 * Рассчет и обновление среднего значения
 */
function updateAverageValue() {
  const skillRanges = document.querySelectorAll(".skill-range");
  const averageValue = document.getElementById("averageValue");
  const levelDescription = document.getElementById("levelDescription");
  const progressFill = document.getElementById("progressFill");

  if (
    !skillRanges.length ||
    !averageValue ||
    !levelDescription ||
    !progressFill
  )
    return;

  let sum = 0;
  skillRanges.forEach((range) => {
    sum += Number.parseInt(range.value);
  });

  const average = Math.round(sum / skillRanges.length);
  averageValue.textContent = average + "%";
  progressFill.style.width = average + "%";

  // Определяем текстовое описание на основе диапазона
  let description = "";
  if (average >= 0 && average <= 25) {
    description = "Начинающий, верный старт";
  } else if (average >= 26 && average <= 50) {
    description = "Прогрессируешь, держи темп";
  } else if (average >= 51 && average <= 75) {
    description = "Уверенно растёшь, почти junior";
  } else if (average >= 76 && average <= 100) {
    description = "Сильная база — готов к портфолио";
  }

  levelDescription.textContent = description;
}

/**
 * Сохранение значений индекса навыков в localStorage
 */
function saveSkillsIndexToStorage() {
  const skillRanges = document.querySelectorAll(".skill-range");
  if (!skillRanges.length) return;

  const skillsData = {};
  skillRanges.forEach((range) => {
    const skillName = range.closest(".skill-slider").dataset.skill;
    skillsData[skillName] = range.value;
  });

  try {
    const localStorageSkllIndexData = Object.assign(
      JSON.parse(localStorage.getItem("skillsIndex")),
      skillsData
    );
    localStorage.setItem(
      "skillsIndex",
      JSON.stringify(localStorageSkllIndexData)
    );
  } catch (error) {
    console.error("Ошибка при сохранении индекса навыков:", error);
  }
}

/**
 * Загрузка значений индекса навыков из localStorage
 */
function loadSkillsIndexFromStorage() {
  const skillRanges = document.querySelectorAll(".skill-range");
  if (!skillRanges.length) return;

  try {
    const storedData = localStorage.getItem("skillsIndex");
    if (storedData) {
      const skillsData = JSON.parse(storedData);
      skillRanges.forEach((range) => {
        const skillName = range.closest(".skill-slider").dataset.skill;
        if (skillsData[skillName]) {
          range.value = skillsData[skillName];
          // Обновляем отображаемое значение
          const valueDisplay = range.nextElementSibling;
          if (valueDisplay?.classList.contains("skill-value")) {
            valueDisplay.textContent = skillsData[skillName] + "%";
          }
        }
      });
    }
  } catch (error) {
    console.error("Ошибка при загрузке индекса навыков:", error);
  }
}
