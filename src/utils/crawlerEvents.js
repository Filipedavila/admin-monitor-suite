import { useSyncExternalStore } from "react";
import i18n from "../i18n";
import { actorText } from "./eventActor";
import { toPercent } from "./evaluationEvents";

/**
 * Estado em tempo real dos crawlers, alimentado pelos eventos SSE `crawler:*`.
 *
 * - `crawlers`: crawlerId -> { status: "running" | "failed" | "stalled", progress: number | null,
 *   websiteId, baseUrl, failedReason? }
 * - `changeTick`: sobe quando um crawler termina, falha ou fica parado, para a lista voltar a pedir os dados.
 *
 * `crawler:drained` (fila vazia) não traz dados e é ignorado.
 */

let state = { crawlers: new Map(), changeTick: 0 };
const listeners = new Set();
const notifiers = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

const updateCrawler = (crawlerId, value, bumpTick = false) => {
  if (crawlerId == null) return;
  const crawlers = new Map(state.crawlers);
  if (value) crawlers.set(crawlerId, value);
  else crawlers.delete(crawlerId);
  setState({ crawlers, ...(bumpTick ? { changeTick: state.changeTick + 1 } : {}) });
};

const notify = (notification) => notifiers.forEach((fn) => fn(notification));

export const handleCrawlerEvent = (payload) => {
  if (!payload || typeof payload !== "object") return;
  const { event: name, crawlerId, websiteId, baseUrl } = payload;
  const base = { website: websiteId, url: baseUrl, id: crawlerId };
  const actor = actorText(payload.userId);

  if (name === "crawler:started") {
    updateCrawler(crawlerId, { status: "running", progress: null, websiteId, baseUrl });
    notify({ type: "info", title: "", message: actor ? i18n.t("CRAWLER_EVENTS.started_by", { ...base, actor }) : i18n.t("CRAWLER_EVENTS.started", base) });
    return;
  }

  if (name === "crawler:progress") {
    updateCrawler(crawlerId, { status: "running", progress: toPercent(payload.progress), websiteId, baseUrl });
    return;
  }

  if (name === "crawler:failed") {
    updateCrawler(crawlerId, { status: "failed", progress: null, websiteId, baseUrl, failedReason: payload.failedReason || null }, true);
    notify({
      type: "error",
      title: "",
      message: i18n.t("CRAWLER_EVENTS.failed", { ...base, reason: payload.failedReason || "-" }),
    });
    return;
  }

  if (name === "crawler:stalled") {
    updateCrawler(crawlerId, { status: "stalled", progress: null, websiteId, baseUrl }, true);
    notify({ type: "warning", title: "", message: i18n.t("CRAWLER_EVENTS.stalled", base) });
    return;
  }

  if (name === "crawler:completed") {
    updateCrawler(crawlerId, null, true);
    notify({ type: "success", title: "", message: i18n.t("CRAWLER_EVENTS.completed", base) });
  }
};

export const subscribeCrawlerNotifications = (fn) => {
  notifiers.add(fn);
  return () => notifiers.delete(fn);
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Live crawler state: { crawlers: Map, changeTick }. */
export const useCrawlerState = () => useSyncExternalStore(subscribe, () => state);
