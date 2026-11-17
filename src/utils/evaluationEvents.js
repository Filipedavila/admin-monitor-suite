import { useSyncExternalStore } from "react";
import i18n from "../i18n";
import { actorText } from "./eventActor";

/**
 * Estado em tempo real das avaliações, alimentado pelos eventos SSE `evaluation:*`.
 *
 * - `pages`: pageId -> { status: "running" | "failed", progress: number | null, websiteId, failedReason? }
 * - `completedTick`: sobe a cada avaliação concluída, para as listas voltarem a pedir os dados.
 *
 * As notificações são por sítio web (uma ao iniciar, outra quando todas as páginas em
 * avaliação desse sítio terminam), com a entidade e os diretórios que o evento traz.
 * Os eventos só trazem IDs: não há nome nem categoria.
 */

const FINISH_DELAY_MS = 2000;

let state = { pages: new Map(), completedTick: 0 };
const listeners = new Set();
const notifiers = new Set();
// websiteId -> { running:Set, total, failed, institutionId, directoryIds, timer }
const runs = new Map();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

const updatePage = (pageId, value) => {
  if (pageId == null) return;
  const pages = new Map(state.pages);
  if (value) pages.set(pageId, value);
  else pages.delete(pageId);
  setState({ pages });
};

const notify = (notification) => notifiers.forEach((fn) => fn(notification));

const scopeText = (run) => {
  const parts = [];
  if (run.institutionId != null) parts.push(i18n.t("EVALUATIONS.scope_institution", { id: run.institutionId }));
  if (run.directoryIds?.length) parts.push(i18n.t("EVALUATIONS.scope_directories", { ids: run.directoryIds.join(", ") }));
  return parts.length ? ` (${parts.join(", ")})` : "";
};

export const toPercent = (progress) => {
  const raw = typeof progress === "number"
    ? progress
    : progress?.percent ?? progress?.percentage ?? progress?.progress;
  const value = Number(raw);
  if (raw == null || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
};

const finishRun = (websiteId) => {
  const run = runs.get(websiteId);
  if (!run || run.running.size > 0) return;
  runs.delete(websiteId);
  const base = { website: websiteId, scope: scopeText(run) };
  if (run.failed > 0) {
    notify({
      type: "warning",
      title: "",
      message: i18n.t("EVALUATIONS.event_completed_failed", { ...base, failed: run.failed, total: run.total }),
    });
  } else {
    notify({ type: "success", title: "", message: i18n.t("EVALUATIONS.event_completed", base) });
  }
};

const onPageDone = (pageId, websiteId, failed) => {
  const run = runs.get(websiteId);
  if (!run) return;
  run.running.delete(pageId);
  if (failed) run.failed += 1;
  if (run.running.size === 0) {
    clearTimeout(run.timer);
    // Small delay: pages of the same website are often evaluated one after another.
    run.timer = setTimeout(() => finishRun(websiteId), FINISH_DELAY_MS);
  }
};

// Todos os eventos (exceto completed) trazem websiteId, pageId, institutionId e directoryIds.
// Se o "started" se perder (ligação SSE tardia), o run é criado pelo primeiro evento recebido.
const trackPage = (payload, announce) => {
  const { websiteId, pageId } = payload;
  if (websiteId == null || pageId == null) return;
  let run = runs.get(websiteId);
  if (!run) {
    run = { running: new Set(), total: 0, failed: 0, institutionId: payload.institutionId, directoryIds: payload.directoryIds, timer: null };
    runs.set(websiteId, run);
    if (announce) {
      const actor = actorText(payload.userId);
      notify({
        type: "info",
        title: "",
        message: actor
          ? i18n.t("EVALUATIONS.event_started_by", { website: websiteId, scope: scopeText(run), actor })
          : i18n.t("EVALUATIONS.event_started", { website: websiteId, scope: scopeText(run) }),
      });
    }
  }
  if (run.institutionId == null) run.institutionId = payload.institutionId;
  if (!run.directoryIds?.length) run.directoryIds = payload.directoryIds;
  clearTimeout(run.timer);
  if (!run.running.has(pageId)) run.total += 1;
  run.running.add(pageId);
};

export const handleEvaluationEvent = (payload) => {
  if (!payload || typeof payload !== "object") return;
  const name = payload.event;

  if (name === "evaluation:started") {
    updatePage(payload.pageId, { status: "running", progress: null, websiteId: payload.websiteId });
    trackPage(payload, true);
    return;
  }

  if (name === "evaluation:progress") {
    updatePage(payload.pageId, { status: "running", progress: toPercent(payload.progress), websiteId: payload.websiteId });
    if (!runs.get(payload.websiteId)?.running.has(payload.pageId)) trackPage(payload, false);
    return;
  }

  if (name === "evaluation:failed") {
    updatePage(payload.pageId, {
      status: "failed",
      progress: null,
      websiteId: payload.websiteId,
      failedReason: payload.failedReason || null,
    });
    if (!runs.get(payload.websiteId)?.running.has(payload.pageId)) trackPage(payload, false);
    onPageDone(payload.pageId, payload.websiteId, true);
    return;
  }

  if (name === "evaluation:completed") {
    const evaluation = payload.evaluation || {};
    const pageId = evaluation.pageId ?? evaluation.page?.id;
    const websiteId = evaluation.websiteId ?? evaluation.website?.id ?? state.pages.get(pageId)?.websiteId;
    updatePage(pageId, null);
    setState({ completedTick: state.completedTick + 1 });
    onPageDone(pageId, websiteId, false);
  }
};

export const subscribeEvaluationNotifications = (fn) => {
  notifiers.add(fn);
  return () => notifiers.delete(fn);
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Live evaluation state: { pages: Map, completedTick }. */
export const useEvaluationState = () => useSyncExternalStore(subscribe, () => state);
