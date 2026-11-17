import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, Icon, Input } from "@a12e/accessmonitor-ds";
import { useNavigate } from "react-router-dom";
import { getUpdateMeErrorKey, updateMe } from "../../services/users";
import { getFailedPasswordRules, getPasswordPolicyStatus } from "../../utils/passwordPolicy";
import "./style.css";

const FIELDS = [
  { name: "currentPassword", id: "change-password-current", label: "CHANGE_PASSWORD.current_password_label", autoComplete: "current-password" },
  { name: "newPassword", id: "change-password-new", label: "CHANGE_PASSWORD.new_password_label", autoComplete: "new-password" },
  { name: "confirmPassword", id: "change-password-confirm", label: "CHANGE_PASSWORD.confirm_password_label", autoComplete: "new-password" },
];

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export const PASSWORD_POLICY_ID = "change-password-policy";

/**
 * Lista das regras da nova palavra-passe, atualizada ao escrever. Sem aria-live: o campo
 * referencia-a por aria-describedby e o erro de submissão é anunciado no role="alert".
 * O estado não depende só da cor: ícone diferente e texto oculto "cumprida"/"por cumprir".
 */
const PasswordPolicyList = ({ value }) => {
  const { t } = useTranslation();
  const titleId = `${PASSWORD_POLICY_ID}-title`;

  return (
    <div id={PASSWORD_POLICY_ID} className="change-password-policy mt-2">
      <p id={titleId} className="mb-1">{t("CHANGE_PASSWORD.policy.title")}</p>
      <ul aria-labelledby={titleId} className="list-unstyled mb-0">
        {getPasswordPolicyStatus(value).map(({ id, min, met }) => (
          <li key={id} className={`change-password-policy__rule ${met ? "is-met" : "is-unmet"}`}>
            <Icon name={met ? "AMA-Certo-Line" : "AMA-Erro-Line"} size={16} />
            <span>{t(`CHANGE_PASSWORD.policy.rules.${id}`, { count: min })}</span>
            <span className="visually-hidden">
              {` (${met ? t("CHANGE_PASSWORD.policy.met") : t("CHANGE_PASSWORD.policy.unmet")})`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const focusField = (name) => {
  const field = FIELDS.find((f) => f.name === name);
  if (field) document.getElementById(field.id)?.focus();
};

/**
 * Formulário "Alterar palavra-passe" (issue #106). Chama PATCH /v2/users/me com
 * { currentPassword, newPassword }; um erro do servidor fica no formulário e não termina a sessão.
 */
export const ChangePasswordForm = ({ theme, onCancel }) => {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY, shouldFocusError: false });
  const newPassword = useWatch({ control, name: "newPassword" });

  const required = t("CHANGE_PASSWORD.required");
  const rules = {
    currentPassword: { required },
    newPassword: {
      required,
      deps: ["confirmPassword"],
      validate: {
        policy: (value) => !value || getFailedPasswordRules(value).length === 0 || t("CHANGE_PASSWORD.policy.error"),
      },
    },
    confirmPassword: {
      required,
      validate: (value) => !value || value === getValues("newPassword") || t("USERS_PAGE.ADD.confirm_password_error"),
    },
  };

  const onValid = async ({ currentPassword, newPassword }) => {
    setResult(null);
    try {
      await updateMe({ currentPassword, newPassword });
      reset(EMPTY);
      setResult({ type: "success", key: "CHANGE_PASSWORD.success" });
    } catch (error) {
      const key = getUpdateMeErrorKey(error);
      if (error?.response?.status === 401) {
        setError("currentPassword", { type: "server", message: t(key) });
        focusField("currentPassword");
      }
      setResult({ type: "error", key });
    }
  };

  const onInvalid = (fieldErrors) => {
    setResult(fieldErrors.newPassword?.type === "policy" ? { type: "error", key: "CHANGE_PASSWORD.policy.error" } : null);
    const first = FIELDS.find((f) => fieldErrors[f.name]);
    if (first) focusField(first.name);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onValid, onInvalid)} className="d-flex flex-column gap-3">
      <p className="mb-0">{t("CHANGE_PASSWORD.description")}</p>

      <div role="status" className={result?.type === "success" ? "alert alert-success mb-0" : undefined}>
        {result?.type === "success" ? t(result.key) : ""}
      </div>
      <div role="alert" className={result?.type === "error" ? "alert alert-danger mb-0" : undefined}>
        {result?.type === "error" ? t(result.key) : ""}
      </div>

      {FIELDS.map((field) => (
        <div key={field.name} className="change-password-form__field w-100">
          <Controller
            name={field.name}
            control={control}
            rules={rules[field.name]}
            render={({ field: { value, onChange, onBlur, name } }) => (
              <Input
                id={field.id}
                name={name}
                label={t(field.label)}
                type="password"
                showPassTextAria={t("LOGIN.show_password")}
                hidePassTextAria={t("LOGIN.hide_password")}
                darkTheme={theme}
                value={value}
                onChange={(e) => onChange(e?.target?.value ?? e)}
                onBlur={onBlur}
                autoComplete={field.autoComplete}
                aria-required="true"
                aria-invalid={errors[field.name] ? "true" : "false"}
                aria-describedby={field.name === "newPassword" ? PASSWORD_POLICY_ID : undefined}
                error={errors[field.name]?.message}
              />
            )}
          />
          {field.name === "newPassword" && <PasswordPolicyList value={newPassword} />}
        </div>
      ))}

      <div className="d-flex gap-3">
        <Button
          type="submit"
          darkTheme={theme}
          variant="primary"
          disabled={isSubmitting}
          text={isSubmitting ? t("CHANGE_PASSWORD.submitting") : t("CHANGE_PASSWORD.submit")}
        />
        <Button type="button" darkTheme={theme} variant="secondary" text={t("CHANGE_PASSWORD.cancel")} onClick={onCancel} />
      </div>
    </form>
  );
};

export const CHANGE_PASSWORD_PATH = "/dashboard/change-password";

/**
 * Botão que abre a página "Alterar palavra-passe". Fica ao lado do Utilizador, acima do menu (SessionInfo).
 */
const ChangePassword = ({ theme, size }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      text={t("CHANGE_PASSWORD.open_button")}
      darkTheme={theme}
      size={size}
      onClick={() => navigate(CHANGE_PASSWORD_PATH)}
      iconRight={<Icon name="AMA-Pessoa-Line" size={16} className="icon-right" />}
    />
  );
};

export default ChangePassword;
