/**
 * Política de palavra-passe (fonte única para o formulário "Alterar palavra-passe").
 *
 * Decisões:
 * - O comprimento conta pontos de código (Array.from), para que um emoji conte como 1 carácter.
 * - Minúsculas e maiúsculas usam as categorias Unicode \p{Ll} e \p{Lu} (flag u): letras
 *   acentuadas contam ("ç", "á" são minúsculas; "Ç", "É" são maiúsculas).
 * - Números são os dígitos 0-9.
 * - Símbolo é qualquer carácter que não seja letra (\p{L}), número (\p{N}) nem espaço (\s).
 *   Assim "!", "_", "€", "º" contam como símbolo; espaços não contam.
 */
export const PASSWORD_POLICY = Object.freeze({
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
});

const PATTERNS = {
  minLowercase: /\p{Ll}/gu,
  minUppercase: /\p{Lu}/gu,
  minNumbers: /[0-9]/g,
  minSymbols: /[^\p{L}\p{N}\s]/gu,
};

const countMatches = (value, pattern) => (value.match(pattern) || []).length;

/** Ordem fixa em que as regras são mostradas e avaliadas. */
export const PASSWORD_RULE_IDS = Object.freeze(["minLength", "minLowercase", "minUppercase", "minNumbers", "minSymbols"]);

/** Estado de cada regra: [{ id, min, met }]. Regras com mínimo 0 ou ausente ficam de fora. */
export const getPasswordPolicyStatus = (value, policy = PASSWORD_POLICY) => {
  const password = typeof value === "string" ? value : "";
  return PASSWORD_RULE_IDS.filter((id) => policy[id] > 0).map((id) => {
    const count = id === "minLength" ? Array.from(password).length : countMatches(password, PATTERNS[id]);
    return { id, min: policy[id], met: count >= policy[id] };
  });
};

/** Ids das regras que a palavra-passe não cumpre (lista vazia = cumpre a política). */
export const getFailedPasswordRules = (value, policy = PASSWORD_POLICY) =>
  getPasswordPolicyStatus(value, policy)
    .filter((rule) => !rule.met)
    .map((rule) => rule.id);
