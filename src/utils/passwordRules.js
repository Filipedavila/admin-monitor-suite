/**
 * Regras de palavra-passe partilhadas pela criação de utilizadores (UserCreateForm)
 * e pela alteração da palavra-passe do próprio utilizador (ChangePassword).
 *
 * Cada formulário passa as suas mensagens: a criação mantém os textos que já tinha,
 * a alteração usa chaves i18n.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

const UPPERCASE = /[A-Z]/;
const LOWERCASE = /[a-z]/;
const NUMBER = /\d/;
const SPECIAL_CHAR = /[!@#$%^&*(),.?":{}|<>]/;

/** Estado de cada requisito para uma palavra-passe (usado nas listas de requisitos). */
export const getPasswordRequirements = (value) => {
  const password = value || "";
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUpperCase: UPPERCASE.test(password),
    hasLowerCase: LOWERCASE.test(password),
    hasNumber: NUMBER.test(password),
    hasSpecialChar: SPECIAL_CHAR.test(password),
  };
};

/**
 * Regras no formato do react-hook-form (`register`/`Controller` rules).
 * `messages`: { required, minLength, maxLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar }.
 * Os testes de caracteres ignoram valores vazios, para que só apareça a mensagem de obrigatório.
 */
export const buildPasswordValidation = (messages) => ({
  required: messages.required,
  minLength: { value: PASSWORD_MIN_LENGTH, message: messages.minLength },
  maxLength: { value: PASSWORD_MAX_LENGTH, message: messages.maxLength },
  validate: {
    hasUpperCase: (value) => !value || UPPERCASE.test(value) || messages.hasUpperCase,
    hasLowerCase: (value) => !value || LOWERCASE.test(value) || messages.hasLowerCase,
    hasNumber: (value) => !value || NUMBER.test(value) || messages.hasNumber,
    hasSpecialChar: (value) => !value || SPECIAL_CHAR.test(value) || messages.hasSpecialChar,
  },
});
