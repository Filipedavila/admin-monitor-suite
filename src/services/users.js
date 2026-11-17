import { api } from "../config/api";
import { SKIP_AUTH_REDIRECT } from "../config/requestFlags";

/**
 * Atualizar o próprio utilizador, segundo a collection v5 (pedido "User > Update User Me"):
 * PATCH /v2/users/me com body { email, newPassword, currentPassword } e autenticação bearer.
 * A collection não traz exemplos de resposta; só se usa o estado HTTP.
 *
 * Só se envia `email` quando é indicado (alteração de email). Para mudar a palavra-passe
 * o body é { currentPassword, newPassword }.
 *
 * O pedido leva a flag SKIP_AUTH_REDIRECT: um 401 aqui pode significar palavra-passe atual
 * errada e não deve terminar a sessão (ver src/config/requestFlags.js).
 */
export const updateMe = ({ currentPassword, newPassword, email } = {}) => {
  const body = { currentPassword, newPassword };
  if (typeof email === "string" && email.trim() !== "") body.email = email.trim();
  return api.patch("/users/me", body, { [SKIP_AUTH_REDIRECT]: true });
};

/** Converte o erro de PATCH /users/me na chave i18n a mostrar. */
export const getUpdateMeErrorKey = (error) => {
  switch (error?.response?.status) {
    case 400:
      return "CHANGE_PASSWORD.errors.bad_request";
    case 401:
      return "CHANGE_PASSWORD.errors.unauthorized";
    case 403:
      return "CHANGE_PASSWORD.errors.forbidden";
    default:
      return "CHANGE_PASSWORD.errors.generic";
  }
};
