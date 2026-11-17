import { api } from "../config/api";

/**
 * Normaliza ids de página para inteiros positivos, sem duplicados.
 * Aceita números ou strings numéricas (ex.: "2331").
 */
export const normalizePageIds = (ids = []) => {
  const unique = new Set();
  for (const raw of ids) {
    const id = typeof raw === "string" ? Number(raw.trim()) : Number(raw);
    if (Number.isInteger(id) && id > 0) unique.add(id);
  }
  return [...unique];
};

/**
 * DELETE /pages com body { "pageIds": [<ids>] }.
 * O axios só envia body num DELETE quando passado em `config.data`.
 */
export const deletePages = (ids) => {
  const pageIds = normalizePageIds(ids);
  if (pageIds.length === 0) {
    return Promise.reject(new Error("deletePages: no valid page ids"));
  }
  return api.delete("/pages", { data: { pageIds } });
};

/**
 * Converte o erro de um pedido de remoção na chave i18n a mostrarn.
 */
export const getDeletePagesErrorKey = (error) => {
  const status = error?.response?.status;
  if (status === 403) return "PAGES_PAGE.DELETE.forbidden";
  return "PAGES_PAGE.DELETE.error";
};

/**
 * Criar páginas (Page > PageController_create_v2):
 * POST /v2/pages/website/{websiteId}/page com body { websiteId: number, pagesUrl: string[] }
 * (ambos obrigatórios, pagesUrl com pelo menos um URL). Exige `website:can_edit` e responde
 * 400 com dados inválidos ou URL duplicado. Substitui o POST /v2/pages com `tag`.
 */
export const createPages = (websiteId, urls) => {
  const id = Number(websiteId);
  const pagesUrl = (urls || []).map((url) => String(url).trim()).filter(Boolean);
  if (!Number.isInteger(id) || id <= 0 || pagesUrl.length === 0) {
    return Promise.reject(new Error("createPages: website id and at least one URL are required"));
  }
  return api.post(`/pages/website/${id}/page`, { websiteId: id, pagesUrl });
};

const SITEMAP_MAX_BYTES = 5 * 1024 * 1024;

/**
 * POST /v2/pages/website/{websiteId}/sitemap (multipart, campo `file`, .xml ou .txt, máx. 5MB).
 * O servidor lê o ficheiro e cria as páginas no sítio web.
 */
export const createPagesFromSitemap = (websiteId, file) => {
  const id = Number(websiteId);
  if (!Number.isInteger(id) || id <= 0 || !file) {
    return Promise.reject(new Error("createPagesFromSitemap: website id and file are required"));
  }
  if (file.size > SITEMAP_MAX_BYTES) {
    return Promise.reject(new Error("createPagesFromSitemap: file exceeds 5MB"));
  }
  const body = new FormData();
  body.append("file", file);
  return api.post(`/pages/website/${id}/sitemap`, body, { headers: { "Content-Type": "multipart/form-data" } });
};

/**
 * Estado "visível no observatório" de uma página devolvida por GET /v2/pages.
 * A listagem global lia `isInObservatory` e a do sítio web `showInMonitor`; aceita os dois
 * até o contrato v5 documentar o campo.
 */
export const isPageInObservatory = (page) => Boolean(page?.isInObservatory ?? page?.showInMonitor);

/**
 * POST /v2/pages/website/{websiteId}/page/{pageId}/toggle-observatory, um pedido por página.
 * Cada linha traz { id, websiteId, inObservatory } (estado antes do toggle).
 * Usa allSettled para que uma falha não esconda as páginas que mudaram.
 */
export const togglePagesObservatory = async (rows = []) => {
  const results = await Promise.allSettled(
    rows.map((row) => api.post(`/pages/website/${row.websiteId}/page/${row.id}/toggle-observatory`))
  );
  const summary = { shown: 0, hidden: 0, failed: 0 };
  results.forEach((result, index) => {
    if (result.status === "rejected") summary.failed += 1;
    else if (rows[index].inObservatory) summary.hidden += 1;
    else summary.shown += 1;
  });
  return summary;
};

/** Mensagem de feedback para o resultado de togglePagesObservatory. */
export const getObservatoryFeedback = ({ shown, hidden, failed }) => {
  const parts = [];
  if (shown > 0) parts.push(`${shown} página(s) passaram a ser mostradas no observatório.`);
  if (hidden > 0) parts.push(`${hidden} página(s) deixaram de ser mostradas no observatório.`);
  if (failed > 0) parts.push(`Não foi possível atualizar ${failed} página(s). Tente novamente.`);
  return parts.join(" ");
};
