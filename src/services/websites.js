import { api } from "../config/api";

const toPositiveIds = (ids = []) => {
  const unique = new Set();
  for (const raw of ids) {
    const id = Number(typeof raw === "string" ? raw.trim() : raw);
    if (Number.isInteger(id) && id > 0) unique.add(id);
  }
  return [...unique];
};

/**
 * DELETE /v2/websites com body { "websiteIds": [<ids>] }, como no pedido "website > Delete Websites" da v5.
 * Um só pedido para todos os sítios web selecionados (ARTE-28); substitui
 * POST /website/deleteBulk e os DELETE /websites/:id um a um.
 */
export const deleteWebsites = (ids) => {
  const websiteIds = toPositiveIds(ids);
  if (websiteIds.length === 0) {
    return Promise.reject(new Error("deleteWebsites: no valid website ids"));
  }
  return api.delete("/websites", { data: { websiteIds } });
};

export const getDeleteWebsitesErrorKey = (error) =>
  error?.response?.status === 403 ? "WEBSITES_DELETE.forbidden" : "WEBSITES_DELETE.error";

// Espaços (incluindo os Unicode), caracteres de controlo C0/C1 e DEL, e os caracteres
// que o RFC 3986 não deixa aparecer sem codificação (< > " ` { } | \ ^).
// eslint-disable-next-line no-control-regex
const INVALID_URL_CHARS = /[\s\u0000-\u001F\u007F-\u009F<>"`{}|\\^]/u;

/** Remove os espaços nas pontas do URL do sítio web. */
export const normalizeWebsiteUrl = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Valida o URL base de um sítio web, depois do trim.
 * Devolve null se for válido, ou a chave i18n do erro:
 * - vazio: "WEBSITES_PAGE.URL.required";
 * - espaço ou caracter de controlo no meio, URL que `new URL()` não aceita,
 *   protocolo diferente de http/https ou sem host: "WEBSITES_PAGE.URL.invalid".
 */
export const getWebsiteUrlErrorKey = (value) => {
  const url = normalizeWebsiteUrl(value);
  if (!url) return "WEBSITES_PAGE.URL.required";
  if (INVALID_URL_CHARS.test(url)) return "WEBSITES_PAGE.URL.invalid";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
      return "WEBSITES_PAGE.URL.invalid";
    }
  } catch {
    return "WEBSITES_PAGE.URL.invalid";
  }
  return null;
};

const canonicalWebsiteUrl = (value) => {
  const url = normalizeWebsiteUrl(value);
  try {
    // `new URL` põe protocolo e host em minúsculas e acrescenta "/" a um URL só com host.
    return new URL(url).href;
  } catch {
    return url;
  }
};

/**
 * Diz se dois URLs de sítio web são o mesmo para efeitos de edição.
 * Compara depois do trim e da normalização de `new URL()`: ignora maiúsculas no
 * protocolo e no host e a barra final quando o URL só tem host
 * ("https://Exemplo.pt" = "https://exemplo.pt/"). O caminho, a query e a barra
 * final num caminho ("/a" vs "/a/") contam, porque o servidor pode distingui-los.
 */
export const isSameWebsiteUrl = (a, b) => canonicalWebsiteUrl(a) === canonicalWebsiteUrl(b);

/**
 * PATCH /v2/websites/:websiteId/url com body { baseUrl }.
 * O URL é enviado com trim. Ainda não está na collection v5 (pedido ao arte-schema-backend).
 */
export const updateWebsiteUrl = (websiteId, baseUrl) =>
  api.patch(`/websites/${websiteId}/url`, { baseUrl: normalizeWebsiteUrl(baseUrl) });

/** Chave i18n da mensagem de erro do PATCH do URL, conforme o estado HTTP. */
export const getUpdateWebsiteUrlErrorKey = (error) => {
  switch (error?.response?.status) {
    case 400: return "WEBSITES_PAGE.URL.update_invalid";
    case 403: return "WEBSITES_PAGE.URL.update_forbidden";
    case 409: return "WEBSITES_PAGE.URL.update_conflict";
    default: return "WEBSITES_PAGE.URL.update_error";
  }
};
