import i18n from "../i18n";

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

// Texto do utilizador que originou o evento: "você" se for o utilizador da sessão,
// caso contrário "utilizador {id}" (os eventos só trazem o ID, não o nome).
export const actorText = (userId) => {
  if (userId == null) return null;
  try {
    const me = JSON.parse(localStorage.getItem("@AMS:user") || "null");
    if (me && [me.id, me.userId, me.sub].some((v) => sameId(v, userId))) return i18n.t("EVENTS.actor_you");
  } catch {
    // sessão ilegível: usa o ID
  }
  return i18n.t("EVENTS.actor_user", { id: userId });
};
