import { useEffect, useRef } from "react";
import { getDefaultApiUrl } from "../config/api.js";

const STREAM_PATH = "/notifications/stream";
const RETRY_BASE_MS = 2000;
const RETRY_MAX_MS = 30000;

const resolveStreamUrl = () => {
  const stored = localStorage.getItem("@AMS:apiUrl");
  const base = (stored || getDefaultApiUrl() || "").replace(/\/+$/, "");
  const pathApi = import.meta.env?.VITE_PATH_API || "/v2";
  return `${base}${pathApi}${STREAM_PATH}`;
};

const seenEvents = new Set();

// Converts one SSE data payload into { type, title, message }.
const parseNotification = (event, data) => {
  let parsed = null;
  try {
    parsed = JSON.parse(data);
  } catch {
    // plain text payload
  }
  if (parsed && typeof parsed === "object") {
    // O servidor envia { event, visibility, timestamp, payload: { event, websiteId, pageId, ... } }.
    // Os dados do evento estão em `payload`; aceita-se também o formato sem envelope.
    const inner = parsed.payload && typeof parsed.payload === "object" ? parsed.payload : parsed;
    const eventName = inner.event || parsed.event || event;
    const isDomainEvent =
      typeof eventName === "string" && (eventName.startsWith("evaluation:") || eventName.startsWith("crawler:"));
    if (isDomainEvent) {
      // O mesmo evento chega uma vez por visibilidade (PRIVATE e AMS): ignora a repetição.
      const key = `${eventName}|${parsed.timestamp ?? ""}|${inner.pageId ?? inner.crawlerId ?? inner.evaluation?.id ?? ""}`;
      if (seenEvents.has(key)) return { ignore: true };
      seenEvents.add(key);
      if (seenEvents.size > 200) seenEvents.delete(seenEvents.values().next().value);
      const eventData = { ...inner, event: eventName };
      return eventName.startsWith("evaluation:") ? { evaluationEvent: eventData } : { crawlerEvent: eventData };
    }
    return {
      type: parsed.type || parsed.level || parsed.status || event || "info",
      title: parsed.title || "",
      message: parsed.message || parsed.text || parsed.description || JSON.stringify(parsed),
    };
  }
  return { type: event || "info", title: "", message: data };
};

// Reads GET /v2/notifications/stream with fetch (EventSource cannot send the Bearer
// token) and calls onNotification for every event. Reconnects with backoff.
export const useNotificationStream = (onNotification, enabled = true) => {
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let retry = 0;
    let timer;

    const connect = async () => {
      const token = localStorage.getItem("@AMS:token");
      if (!token) {
        // Sem token (ainda não autenticado): volta a tentar em vez de desistir para sempre.
        retry += 1;
        timer = setTimeout(connect, RETRY_BASE_MS);
        return;
      }
      try {
        const url = resolveStreamUrl();
        console.debug("[notifications] a ligar a", url);
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`SSE ${response.status}`);
        retry = 0;
        console.debug("[notifications] ligado");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          let sep;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            let event = "";
            const dataLines = [];
            block.split("\n").forEach((line) => {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
            });
            if (dataLines.length) handlerRef.current(parseNotification(event, dataLines.join("\n")));
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Notification stream error:", error);
      }
      if (controller.signal.aborted) return;
      retry += 1;
      timer = setTimeout(connect, Math.min(RETRY_BASE_MS * 2 ** (retry - 1), RETRY_MAX_MS));
    };

    connect();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled]);
};
