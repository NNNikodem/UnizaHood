/**
 * Formátuje časový údaj ako relatívny text (napr. "pred 5 minútami")
 * @param {Date} date - Dátum na formátovanie
 * @returns {string} Formátovaný text s relatívnym časom
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSecs < 60) {
    return "Práve teraz";
  } else if (diffInMins < 60) {
    return `pred ${diffInMins} ${getSlovakPluralForm(
      diffInMins,
      "minútou",
      "minútami",
      "minútami"
    )}`;
  } else if (diffInHours < 24) {
    return `pred ${diffInHours} ${getSlovakPluralForm(
      diffInHours,
      "hodinou",
      "hodinami",
      "hodinami"
    )}`;
  } else if (diffInDays < 7) {
    return `pred ${diffInDays} ${getSlovakPluralForm(
      diffInDays,
      "dňom",
      "dňami",
      "dňami"
    )}`;
  } else if (diffInWeeks < 4) {
    return `pred ${diffInWeeks} ${getSlovakPluralForm(
      diffInWeeks,
      "týždňom",
      "týždňami",
      "týždňami"
    )}`;
  } else if (diffInMonths < 12) {
    return `pred ${diffInMonths} ${getSlovakPluralForm(
      diffInMonths,
      "mesiacom",
      "mesiacmi",
      "mesiacmi"
    )}`;
  } else {
    // Pre dlhšie obdobia použijeme normálny dátum
    return formatDate(date);
  }
};

/**
 * Formátuje dátum do štandardného formátu
 * @param {Date} date - Dátum na formátovanie
 * @returns {string} Formátovaný dátum
 */
export const formatDate = (date) => {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    console.error("Chyba pri formátovaní dátumu:", e);
    return String(date);
  }
};

/**
 * Vráti správny tvar slova v slovenčine podľa čísla
 * @param {number} count - Číslo pre určenie tvaru
 * @param {string} singular - Tvar pre jednotné číslo (1)
 * @param {string} plural2to4 - Tvar pre 2-4
 * @param {string} plural5plus - Tvar pre 5 a viac
 * @returns {string} Správny tvar slova
 */
const getSlovakPluralForm = (count, singular, plural2to4, plural5plus) => {
  if (count === 1) {
    return singular;
  } else if (count >= 2 && count <= 4) {
    return plural2to4;
  } else {
    return plural5plus;
  }
};

/**
 * Formátuje dátum a čas eventu
 * @param {string} dateString - ISO dátum eventu
 * @returns {string} Formátovaný dátum a čas
 */
export const formatEventDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Formát: "Sobota, 15. mája 2023, 14:00"
  return date.toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
