const SIZE = 28;
const STROKE = 4;
const CENTER = SIZE / 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// The design system only renders DangerousHTML cells as HTML when the string contains the exact
// text "<code>", "<mark>" or "<meta". A leading <meta> is invisible and satisfies that check.
const wrap = (html) => `<meta name="evaluation-status">${html}`;

const svg = (label, inner) =>
  wrap(`<svg role="img" aria-label="${label}" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" style="vertical-align:middle"><title>${label}</title>${inner}</svg>`);

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const track = `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#c9ced6" stroke-width="${STROKE}"/>`;

const arc = (color, length, extra = "") =>
  `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round" stroke-dasharray="${length} ${CIRCUMFERENCE}" transform="rotate(-90 ${CENTER} ${CENTER})">${extra}</circle>`;

/**
 * HTML (SVG) for the page evaluation status column (column type "DangerousHTML").
 * live: { status: "running" | "failed", progress: number | null, failedReason?: string } from the evaluation events store.
 */
export const evaluationStatusHtml = (live, evaluated) => {
  if (live?.status === "running") {
    if (live.progress == null || live.progress <= 0) {
      const spin = `<animateTransform attributeName="transform" type="rotate" from="-90 ${CENTER} ${CENTER}" to="270 ${CENTER} ${CENTER}" dur="1s" repeatCount="indefinite"/>`;
      return svg("A avaliar", track + arc("#0b5cab", CIRCUMFERENCE * 0.25, spin));
    }
    const pct = Math.round(live.progress);
    return svg(
      `A avaliar: ${pct}%`,
      track + arc("#0b5cab", (CIRCUMFERENCE * pct) / 100) +
        `<text x="${CENTER}" y="${CENTER + 3}" text-anchor="middle" font-size="8" fill="currentColor">${pct}</text>`
    );
  }
  if (live?.status === "failed") {
    const reason = live.failedReason ? `: ${escapeHtml(live.failedReason)}` : "";
    return svg(
      `Falha na avaliação${reason}`,
      `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#c0392b" stroke-width="${STROKE}"/><path d="M10 10l8 8M18 10l-8 8" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>`
    );
  }
  if (evaluated) {
    return svg(
      "Avaliada",
      `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#1e8449" stroke-width="${STROKE}"/><path d="M9 14.5l3.5 3.5L19 11" fill="none" stroke="#1e8449" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  return svg(
    "Sem avaliação",
    `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#8a919c" stroke-width="${STROKE}" stroke-dasharray="3 3"/>`
  );
};

const progressSvg = (live, label) => {
  if (live.progress == null || live.progress <= 0) {
    const spin = `<animateTransform attributeName="transform" type="rotate" from="-90 ${CENTER} ${CENTER}" to="270 ${CENTER} ${CENTER}" dur="1s" repeatCount="indefinite"/>`;
    return svg(label, track + arc("#0b5cab", CIRCUMFERENCE * 0.25, spin));
  }
  const pct = Math.round(live.progress);
  return svg(
    `${label}: ${pct}%`,
    track + arc("#0b5cab", (CIRCUMFERENCE * pct) / 100) +
      `<text x="${CENTER}" y="${CENTER + 3}" text-anchor="middle" font-size="8" fill="currentColor">${pct}</text>`
  );
};

/**
 * HTML (SVG) for the crawler "Estado" column (column type "DangerousHTML").
 * status: backend status ("PENDING" | "PROCESSING" | "COMPLETED" | "FAILED").
 * live: { status: "running" | "failed" | "stalled", progress, failedReason? } from the crawler events store.
 */
export const crawlerStatusHtml = (status, live) => {
  const state = live?.status ?? (status === "PROCESSING" ? "running" : status === "FAILED" ? "failed" : status);
  if (state === "running") return progressSvg(live ?? { progress: null }, "Em andamento");
  if (state === "failed" || state === "FAILED") {
    const reason = live?.failedReason ? `: ${escapeHtml(live.failedReason)}` : "";
    return svg(
      `Falhou${reason}`,
      `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#c0392b" stroke-width="${STROKE}"/><path d="M10 10l8 8M18 10l-8 8" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>`
    );
  }
  if (state === "stalled") {
    return svg(
      "Parado sem progresso",
      `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#b9770e" stroke-width="${STROKE}"/><path d="M11 9v10M17 9v10" stroke="#b9770e" stroke-width="2.5" stroke-linecap="round"/>`
    );
  }
  if (state === "COMPLETED") {
    return svg(
      "Concluído",
      `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#1e8449" stroke-width="${STROKE}"/><path d="M9 14.5l3.5 3.5L19 11" fill="none" stroke="#1e8449" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  return svg(
    "Pendente",
    `<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#8a919c" stroke-width="${STROKE}" stroke-dasharray="3 3"/>`
  );
};
