/**
 * CityFresh — Fruit SVG Icon Library
 * Minimal single-stroke style inspired by the reference icon sheet.
 * Each icon is a self-contained SVG string (viewBox 0 0 40 40).
 * Stroke color is injected at render time using currentColor.
 */

const FruitIcons = (() => {

  // Each value is an SVG path/shapes string (no outer <svg> tag)
  // drawn on a 40×40 canvas, stroke-only, no fill except white/transparent
  const icons = {

    Apple: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10 C20 10 21 7 24 7"/>
      <path d="M13 16 C11 13 13 9 17 9 C19 9 20 10 20 10 C20 10 21 9 24 9 C28 9 30 13 29 17 C28 22 25 30 20 30 C15 30 12 22 13 16Z"/>
      <path d="M20 10 L20 14"/>
    </g>`,

    Blueberry: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="22" r="8"/>
      <circle cx="13" cy="16" r="5"/>
      <circle cx="27" cy="16" r="5"/>
      <line x1="20" y1="14" x2="20" y2="10"/>
      <path d="M17 10 Q20 8 23 10"/>
      <path d="M20 22 Q21 20 22 22"/>
      <path d="M13 16 Q14 14 15 16"/>
      <path d="M27 16 Q28 14 29 16"/>
    </g>`,

    Raspberry: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="19" r="4.5"/>
      <circle cx="24" cy="19" r="4.5"/>
      <circle cx="20" cy="13" r="4.5"/>
      <circle cx="20" cy="25" r="4.5"/>
      <line x1="20" y1="8" x2="20" y2="5"/>
      <path d="M17 6 Q20 4 23 6"/>
      <path d="M16 19 Q17 18 18 19"/>
      <path d="M24 19 Q25 18 26 19"/>
      <path d="M20 13 Q21 12 22 13"/>
    </g>`,

    Strawberry: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C14 26 10 20 11 15 C12 11 15 10 17 11 C18 11 19 12 20 12 C21 12 22 11 23 11 C25 10 28 11 29 15 C30 20 26 26 20 30Z"/>
      <path d="M16 9 C17 7 19 7 20 8 C21 7 23 7 24 9"/>
      <line x1="20" y1="8" x2="20" y2="12"/>
      <circle cx="17" cy="18" r="1" fill="currentColor"/>
      <circle cx="23" cy="18" r="1" fill="currentColor"/>
      <circle cx="20" cy="22" r="1" fill="currentColor"/>
    </g>`,

    Lychee: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="21" r="10"/>
      <path d="M14 15 Q20 11 26 15"/>
      <path d="M12 20 Q11 14 16 12"/>
      <path d="M28 20 Q29 14 24 12"/>
      <path d="M13 25 Q14 29 20 30 Q26 29 27 25"/>
      <line x1="20" y1="11" x2="20" y2="8"/>
      <path d="M18 8 Q20 6 22 8"/>
    </g>`,

    Durian: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="20" cy="22" rx="10" ry="9"/>
      <path d="M20 13 L20 7"/>
      <path d="M17 8 Q20 5 23 8"/>
      <line x1="12" y1="17" x2="8" y2="13"/>
      <line x1="14" y1="14" x2="11" y2="10"/>
      <line x1="28" y1="17" x2="32" y2="13"/>
      <line x1="26" y1="14" x2="29" y2="10"/>
      <line x1="11" y1="24" x2="7" y2="26"/>
      <line x1="29" y1="24" x2="33" y2="26"/>
      <line x1="13" y1="28" x2="10" y2="32"/>
      <line x1="27" y1="28" x2="30" y2="32"/>
    </g>`,

    'Dragon Fruit': `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="20" cy="21" rx="10" ry="11"/>
      <path d="M13 14 Q10 8 14 6 Q16 12 13 14Z"/>
      <path d="M20 10 Q20 4 24 4 Q22 10 20 10Z"/>
      <path d="M27 14 Q30 8 26 6 Q24 12 27 14Z"/>
      <path d="M10 22 Q4 20 5 16 Q11 19 10 22Z"/>
      <path d="M30 22 Q36 20 35 16 Q29 19 30 22Z"/>
      <path d="M13 28 Q9 32 12 35 Q15 30 13 28Z"/>
      <path d="M27 28 Q31 32 28 35 Q25 30 27 28Z"/>
    </g>`,

    Mango: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C13 28 10 22 11 17 C12 12 16 9 20 9 C24 9 28 12 29 17 C30 22 27 28 20 30Z"/>
      <line x1="20" y1="9" x2="20" y2="5"/>
      <path d="M17 6 Q20 3 24 5"/>
    </g>`,

    Pear: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 29 C14 28 11 23 12 18 C13 14 16 13 16 13 C15 11 15 9 17 8 C19 7 21 7 22 9 C23 10 24 11 24 13 C24 13 27 14 28 18 C29 23 26 28 20 29Z"/>
      <line x1="19" y1="7" x2="22" y2="5"/>
    </g>`,

    Avocado: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 31 C14 30 11 24 12 18 C13 13 16 9 20 9 C24 9 27 13 28 18 C29 24 26 30 20 31Z"/>
      <circle cx="20" cy="22" r="5"/>
      <line x1="20" y1="9" x2="20" y2="6"/>
      <path d="M18 6 Q20 4 22 6"/>
    </g>`,

    Kiwi: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="20" r="11"/>
      <circle cx="20" cy="20" r="5"/>
      <line x1="20" y1="15" x2="20" y2="9"/>
      <line x1="25" y1="17" x2="30" y2="13"/>
      <line x1="25" y1="23" x2="30" y2="27"/>
      <line x1="20" y1="25" x2="20" y2="31"/>
      <line x1="15" y1="23" x2="10" y2="27"/>
      <line x1="15" y1="17" x2="10" y2="13"/>
    </g>`,

    Persimmon: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 29 C13 28 10 23 11 18 C12 13 15 11 20 11 C25 11 28 13 29 18 C30 23 27 28 20 29Z"/>
      <path d="M15 11 Q17 7 20 7 Q23 7 25 11"/>
      <path d="M17 7 L17 10"/>
      <path d="M23 7 L23 10"/>
      <line x1="20" y1="7" x2="20" y2="5"/>
    </g>`,

    Peach: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C13 28 10 22 11 17 C12 12 16 9 20 9 C24 9 28 12 29 17 C30 22 27 28 20 30Z"/>
      <path d="M20 30 Q20 20 20 9"/>
      <line x1="20" y1="9" x2="22" y2="6"/>
      <path d="M20 6 Q22 4 24 6"/>
    </g>`,

    Plum: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 29 C14 28 11 22 12 17 C13 12 16 10 20 10 C24 10 27 12 28 17 C29 22 26 28 20 29Z"/>
      <line x1="20" y1="10" x2="20" y2="7"/>
      <path d="M18 8 Q20 5 22 7"/>
      <path d="M20 29 Q19 22 20 10"/>
    </g>`,

    Orange: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="21" r="10"/>
      <line x1="20" y1="11" x2="20" y2="7"/>
      <path d="M17 8 Q20 5 23 8"/>
      <path d="M11 18 Q15 14 20 21 Q25 28 29 24"/>
      <path d="M11 24 Q15 20 20 21"/>
    </g>`,

    Nectarine: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C13 28 10 22 11 17 C12 12 16 9 20 9 C24 9 28 12 29 17 C30 22 27 28 20 30Z"/>
      <path d="M16 9 Q18 7 20 9"/>
      <path d="M20 9 Q22 7 24 9"/>
      <line x1="20" y1="7" x2="20" y2="5"/>
    </g>`,

    'Sweet Potato': `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 22 C10 16 13 12 20 12 C27 12 30 16 30 22 C30 27 26 30 20 30 C14 30 10 27 10 22Z"/>
      <path d="M15 12 Q14 8 17 7"/>
      <path d="M20 12 Q20 8 22 7"/>
      <path d="M25 12 Q26 8 24 7"/>
    </g>`,

    Melon: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="20" cy="21" rx="11" ry="9"/>
      <path d="M12 16 Q16 21 12 26"/>
      <path d="M17 13 Q20 21 17 29"/>
      <path d="M23 13 Q20 21 23 29"/>
      <path d="M28 16 Q24 21 28 26"/>
      <line x1="20" y1="12" x2="20" y2="9"/>
      <path d="M18 9 Q20 7 22 9"/>
    </g>`,

    Grape: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="15" cy="16" r="4"/>
      <circle cx="25" cy="16" r="4"/>
      <circle cx="20" cy="22" r="4"/>
      <circle cx="12" cy="23" r="4"/>
      <circle cx="28" cy="23" r="4"/>
      <circle cx="20" cy="29" r="4"/>
      <line x1="20" y1="12" x2="20" y2="8"/>
      <path d="M17 9 Q20 6 24 8"/>
    </g>`,

    Cherry: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13" cy="24" r="6"/>
      <circle cx="27" cy="24" r="6"/>
      <path d="M13 18 Q13 12 20 9 Q27 12 27 18"/>
      <line x1="20" y1="9" x2="20" y2="6"/>
    </g>`,

    Watermelon: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 24 Q9 14 20 10 Q31 14 31 24Z"/>
      <line x1="9" y1="24" x2="31" y2="24"/>
      <line x1="14" y1="16" x2="12" y2="24"/>
      <line x1="20" y1="13" x2="20" y2="24"/>
      <line x1="26" y1="16" x2="28" y2="24"/>
      <circle cx="16" cy="21" r="1" fill="currentColor"/>
      <circle cx="22" cy="19" r="1" fill="currentColor"/>
    </g>`,

    Lemon: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 20 C9 14 13 10 20 10 C27 10 31 14 31 20 C31 26 27 30 20 30 C13 30 9 26 9 20Z"/>
      <path d="M20 10 Q22 8 25 9"/>
      <path d="M20 30 Q18 32 15 31"/>
    </g>`,

    Banana: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 28 C10 24 10 16 15 11 C19 7 26 7 29 10"/>
      <path d="M12 28 C15 30 21 30 26 27 C30 24 31 19 29 10"/>
      <line x1="29" y1="10" x2="31" y2="8"/>
    </g>`,

    Pineapple: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 18 C13 12 16 10 20 10 C24 10 27 12 27 18 C27 24 24 30 20 30 C16 30 13 24 13 18Z"/>
      <path d="M14 15 Q17 13 20 15 Q23 13 26 15"/>
      <path d="M13 19 Q16 17 20 19 Q24 17 27 19"/>
      <path d="M14 23 Q17 21 20 23 Q23 21 26 23"/>
      <line x1="17" y1="10" x2="15" y2="6"/>
      <line x1="20" y1="10" x2="20" y2="5"/>
      <line x1="23" y1="10" x2="25" y2="6"/>
    </g>`,

    Coconut: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="21" r="10"/>
      <path d="M13 15 Q17 12 23 15"/>
      <path d="M12 21 Q16 18 24 21"/>
      <path d="M13 27 Q17 24 24 27"/>
      <line x1="20" y1="11" x2="20" y2="8"/>
      <path d="M17 8 C17 5 23 5 23 8"/>
    </g>`,

    Pomegranate: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22 C12 15 15 11 20 11 C25 11 28 15 28 22 C28 27 25 30 20 30 C15 30 12 27 12 22Z"/>
      <path d="M16 11 Q18 7 20 7 Q22 7 24 11"/>
      <line x1="20" y1="7" x2="20" y2="5"/>
      <circle cx="17" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="23" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="24" r="1.5" fill="currentColor"/>
      <circle cx="23" cy="24" r="1.5" fill="currentColor"/>
    </g>`,

    Fig: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C14 29 11 24 12 18 C13 13 16 11 20 11 C24 11 27 13 28 18 C29 24 26 29 20 30Z"/>
      <line x1="20" y1="11" x2="20" y2="7"/>
      <path d="M17 9 L15 6"/>
      <path d="M23 9 L25 6"/>
      <path d="M20 7 L20 5"/>
    </g>`,

    Papaya: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 28 C12 24 12 16 15 11 C17 8 23 8 25 11 C28 16 28 24 26 28 C24 31 16 31 14 28Z"/>
      <line x1="20" y1="8" x2="20" y2="5"/>
      <path d="M17 5 Q20 3 23 5"/>
      <ellipse cx="20" cy="20" rx="4" ry="6"/>
    </g>`,

    Guava: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 30 C13 29 10 23 11 18 C12 13 15 10 20 10 C25 10 28 13 29 18 C30 23 27 29 20 30Z"/>
      <path d="M15 10 Q17 6 20 7 Q23 6 25 10"/>
      <circle cx="20" cy="20" r="4"/>
      <line x1="20" y1="16" x2="20" y2="14"/>
      <line x1="24" y1="20" x2="26" y2="20"/>
    </g>`,

    Mandarin: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="22" r="9"/>
      <line x1="20" y1="13" x2="20" y2="9"/>
      <path d="M17 10 Q20 7 23 10"/>
      <path d="M12" y1="19" x2="28" y2="19"/>
      <path d="M12 19 Q20 13 28 19"/>
      <path d="M12 25 Q20 31 28 25"/>
    </g>`,

    Longan: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="21" r="9"/>
      <circle cx="20" cy="21" r="4.5"/>
      <line x1="20" y1="12" x2="20" y2="8"/>
      <path d="M18 9 Q20 6 22 9"/>
    </g>`,

    Mangosteen: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="22" r="9"/>
      <path d="M14 14 Q17 10 20 10 Q23 10 26 14"/>
      <line x1="17" y1="12" x2="17" y2="10"/>
      <line x1="20" y1="13" x2="20" y2="10"/>
      <line x1="23" y1="12" x2="23" y2="10"/>
      <path d="M15 29 Q17 32 20 31 Q23 32 25 29"/>
    </g>`,
  };

  // Fallback generic fruit icon for any unlisted category
  const fallback = `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="20" cy="21" r="10"/>
    <line x1="20" y1="11" x2="20" y2="7"/>
    <path d="M17 8 Q20 5 23 8"/>
  </g>`;

  /**
   * Get SVG icon markup for a category name.
   * @param {string} name  - category name
   * @param {string} color - stroke color (hex or CSS variable)
   * @param {number} size  - pixel size (default 32)
   */
  function get(name, color = 'currentColor', size = 32) {
    const content = icons[name] || fallback;
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      style="color:${color};display:block;flex-shrink:0"
      aria-hidden="true">${content}</svg>`;
  }

  /** Returns all available icon names */
  function all() { return Object.keys(icons); }

  /** Returns raw SVG inner content for a name (for editor use) */
  function raw(name) { return icons[name] || fallback; }

  return { get, all, raw, fallback };
})();
