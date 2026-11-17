import { useCallback, useEffect, useState } from "react";
import { useNotificationStream } from "../../hooks/useNotificationStream.js";
import { handleEvaluationEvent, subscribeEvaluationNotifications } from "../../utils/evaluationEvents.js";
import { handleCrawlerEvent, subscribeCrawlerNotifications } from "../../utils/crawlerEvents.js";

const AUTO_CLOSE_MS = 8000;
const MAX_TOASTS = 5;

const VARIANTS = {
  success: "text-bg-success",
  error: "text-bg-danger",
  danger: "text-bg-danger",
  warning: "text-bg-warning",
  info: "text-bg-primary",
};

let nextId = 0;

const Toasts = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((notification) => {
    const id = ++nextId;
    setToasts((current) => [...current, { ...notification, id }].slice(-MAX_TOASTS));
    setTimeout(() => dismiss(id), AUTO_CLOSE_MS);
  }, [dismiss]);

  // Evaluation started/completed notifications (grouped by website) come from the store.
  useEffect(() => subscribeEvaluationNotifications(show), [show]);

  useEffect(() => subscribeCrawlerNotifications(show), [show]);

  useNotificationStream(
    useCallback((notification) => {
      // Only evaluation and crawler events produce notifications;
      // any other stream message is ignored.
      if (notification.evaluationEvent) handleEvaluationEvent(notification.evaluationEvent);
      else if (notification.crawlerEvent) handleCrawlerEvent(notification.crawlerEvent);
    }, [])
  );

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 2000 }}
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show ${VARIANTS[String(toast.type).toLowerCase()] || VARIANTS.info}`}
        >
          <div className="d-flex align-items-start">
            <div className="toast-body">
              {toast.title && <strong className="d-block">{toast.title}</strong>}
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Fechar notificação"
              onClick={() => dismiss(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
