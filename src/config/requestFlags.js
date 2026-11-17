/**
 * Flags de configuração por pedido, passadas no `config` do axios
 * (ex.: api.patch(url, body, { [SKIP_AUTH_REDIRECT]: true })). O axios mantém chaves
 * desconhecidas no config, que chega aos interceptors em `error.config`.
 *
 * SKIP_AUTH_REDIRECT: o pedido trata ele próprio as respostas 401/403 e o interceptor
 * de resposta NÃO deve terminar a sessão nem redirecionar para o login.
 * Caso de uso: PATCH /users/me (alterar a palavra-passe), em que uma palavra-passe atual
 * errada pode devolver 401 e deve só mostrar o erro no formulário.
 *
 * Quando a ARTE-23 repuser o interceptor de 401 em src/config/api.js, este tem de começar por:
 *
 *   if (isAuthRedirectSkipped(error.config)) return Promise.reject(error);
 */
export const SKIP_AUTH_REDIRECT = "skipAuthRedirect";

export const isAuthRedirectSkipped = (config) => config?.[SKIP_AUTH_REDIRECT] === true;
