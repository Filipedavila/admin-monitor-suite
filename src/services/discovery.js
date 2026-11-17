import { api } from "../config/api";

/**
 * Discovery (crawler), segundo a collection Monitor-server-v5:
 * - "Discovery > Crawl Website Tags": POST /v2/discovery/:tagId, sem body nem query.
 *   Pede a procura automática de páginas de todos os sítios web de uma categoria (tag).
 * - "Discovery > Crawl Website": POST /v2/discovery com body { "websitesId": [<ids>] }.
 *
 * A collection não traz exemplo de resposta para nenhum dos dois pedidos; só se usa o
 * estado HTTP (2xx = pedido aceite, o crawl corre em segundo plano).
 */

const toPositiveIds = (ids = []) => {
  const unique = new Set();
  for (const raw of ids) {
    const id = Number(typeof raw === "string" ? raw.trim() : raw);
    if (Number.isInteger(id) && id > 0) unique.add(id);
  }
  return [...unique];
};

export const crawlTag = (tagId) => api.post(`/discovery/${tagId}`);

/**
 * Pede o crawl de várias categorias (um pedido por categoria) e espera por todos.
 * Devolve { total, succeeded: number[], failed: [{ id, error }] }.
 */
export const crawlTags = async (ids) => {
  const tagIds = toPositiveIds(ids);
  const results = await Promise.allSettled(tagIds.map((id) => crawlTag(id)));
  const succeeded = [];
  const failed = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") succeeded.push(tagIds[index]);
    else failed.push({ id: tagIds[index], error: result.reason });
  });
  return { total: tagIds.length, succeeded, failed };
};

/**
 * Converte o resultado de crawlTags na mensagem a mostrar (chave i18n + parâmetros)
 * e no papel ARIA da mensagem: "status" para sucesso, "alert" para erro ou falha parcial.
 */
export const getCrawlTagsFeedback = ({ total, succeeded, failed }) => {
  if (total === 0) return { key: "CRAWL_TAGS.none_selected", role: "alert" };
  if (failed.length === 0) {
    return { key: "CRAWL_TAGS.started", params: { count: succeeded.length }, role: "status" };
  }
  if (failed.some((f) => f.error?.response?.status === 403)) {
    return { key: "CRAWL_TAGS.forbidden", role: "alert" };
  }
  if (succeeded.length === 0) return { key: "CRAWL_TAGS.error", role: "alert" };
  return { key: "CRAWL_TAGS.partial", params: { failed: failed.length, total }, role: "alert" };
};

export const crawlWebsites = (ids) => {
  const websitesId = toPositiveIds(ids);
  if (websitesId.length === 0) {
    return Promise.reject(new Error("crawlWebsites: no valid website ids"));
  }
  return api.post("/discovery", { websitesId });
};
