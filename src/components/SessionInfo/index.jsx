import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import "./style.css";

// amsEnv codes returned by POST /auth/login (data.amsEnv) mapped to i18n keys.
const ENVIRONMENT_KEYS = {
  DEV: "development",
  DEVELOPMENT: "development",
  TEST: "test",
  TST: "test",
  QA: "test",
  PPR: "preproduction",
  PREPROD: "preproduction",
  PRD: "production",
  PROD: "production",
  PRODUCTION: "production",
};

const AUTHORIZATION_LEVEL_KEYS = ["manager", "editor", "viewer"];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export const getEnvironmentLabel = (amsEnv, t) => {
  const value = clean(amsEnv);
  if (!value) return null;
  const key = ENVIRONMENT_KEYS[value.toUpperCase()];
  return key ? t(`HEADER.session.environments.${key}`) : value;
};

export const getProfileLabel = (authorizationLevel, t) => {
  const value = clean(authorizationLevel).toLowerCase();
  if (!value) return null;
  return AUTHORIZATION_LEVEL_KEYS.includes(value)
    ? t(`HEADER.session.profiles.${value}`)
    : clean(authorizationLevel);
};

// Prefers a full name when the session has one; falls back to the JWT username.
export const getUserDisplayName = (user) =>
  clean(user?.name) || clean(user?.username) || null;

// userAction: optional control (e.g. "Alterar palavra-passe") shown on the same line as the user.
const SessionInfo = ({ userAction = null }) => {
  const { t } = useTranslation();
  const { user, amsEnv, authorizationLevel } = useAuth();

  const items = [
    { id: "environment", term: t("HEADER.session.environment"), value: getEnvironmentLabel(amsEnv, t) },
    { id: "profile", term: t("HEADER.session.profile"), value: getProfileLabel(authorizationLevel, t) },
    { id: "user", term: t("HEADER.session.user"), value: getUserDisplayName(user) },
  ].filter((item) => item.value);

  const hasUser = items.some((item) => item.id === "user");

  if (items.length === 0 && !userAction) return null;

  return (
    <section className="session-info" aria-label={t("HEADER.session.label")}>
      {items.length > 0 && (
        <dl className="session-info__list">
          {items.map((item) => (
            <div key={item.id} className={`session-info__item session-info__item--${item.id}`}>
              <dt>{item.term}</dt>
              {item.id === "user" && userAction ? (
                <dd className="session-info__user-row">
                  <span className="session-info__user-name">{item.value}</span>
                  <span className="session-info__user-action">{userAction}</span>
                </dd>
              ) : (
                <dd>{item.value}</dd>
              )}
            </div>
          ))}
        </dl>
      )}
      {/* Old sessions may lack a user name: keep the action reachable anyway. */}
      {userAction && !hasUser && <div className="session-info__user-action">{userAction}</div>}
    </section>
  );
};

export default SessionInfo;
