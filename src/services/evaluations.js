import { api } from "../config/api";

/**
 * Avaliações (ARTE-27), segundo a collection Monitor-server-v5 (pedido "Evaluation > Create"):
 * POST /v2/evaluations/website/:websiteId/evaluate-many-pages, sem body.
 *
 * Só a avaliação por sítio web tem equivalente na v5. As avaliações por página, categoria,
 * diretório e entidade continuam no legado POST /evaluations { triggerType, targetIds }.
 */

const toPositiveIds = (ids = []) => {
  const unique = new Set();
  for (const raw of ids) {
    const id = Number(typeof raw === "string" ? raw.trim() : raw);
    if (Number.isInteger(id) && id > 0) unique.add(id);
  }
  return [...unique];
};

export const evaluateWebsite = (websiteId) =>
  api.post(`/evaluations`,{
    targetIds: websiteId,
    triggerType: "WEBSITE"
  });

/**
 * Pede a avaliação de vários sítios web (um pedido por sítio web) e espera por todos.
 * Devolve { total, succeeded: number[], failed: [{ id, error }] }.
 */
export const evaluateWebsites = async (ids) => {
  const websiteIds = toPositiveIds(ids);
  const results = await evaluateWebsite(websiteIds);
  const succeeded = [];
  const failed = [];
  return results;
};

/**
 * Converte o resultado de evaluateWebsites na mensagem a mostrar (chave i18n + parâmetros).
 */
export const getEvaluationFeedback = ({ total, succeeded, failed }) => {
  if (total === 0) return { key: "EVALUATIONS.no_websites" };
  if (failed.length === 0) return { key: "EVALUATIONS.started", params: { count: succeeded.length } };
  if (failed.some((f) => f.error?.response?.status === 403)) return { key: "EVALUATIONS.forbidden" };
  if (succeeded.length === 0) return { key: "EVALUATIONS.error" };
  return { key: "EVALUATIONS.partial", params: { failed: failed.length, total } };
};
