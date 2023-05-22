/// <reference lib="dom" />

import type { Dht22MeasuredValueList } from "./types";

export function renderDom(dom: HTMLElement, data: Dht22MeasuredValueList) {
  const length = data.rows.length;

  const html = data.rows.slice(-10)
    .map((row, i) => {
      return [
        `<li style="animation-delay: ${((Math.min(length, 10) - i) / 10).toFixed(1)}s;">`,
        `  <span data-tooltip="온도">${row.temperature.toFixed(1)}°C</span>`,
        `  <span data-tooltip="습도">${row.humidity.toFixed(1)}%</span>`,
        `  <span data-tooltip="측정 시각"><time>${new Date(row.time * 1000).toLocaleString()}</time></span>`,
        `</li>`
      ].join("");
    })
    .join("");
  dom.innerHTML = html;
}