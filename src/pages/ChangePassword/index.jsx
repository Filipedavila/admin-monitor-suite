import { Breadcrumb } from "@a12e/accessmonitor-ds";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { ChangePasswordForm } from "../../components/ChangePassword";

/** Página "Alterar palavra-passe" do próprio utilizador (antes era um modal aberto no header). */
export default function ChangePasswordPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: t("CHANGE_PASSWORD.title") },
  ];

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t("CHANGE_PASSWORD.title")}</h1>
      <div className="content bg-white p-4">
        <ChangePasswordForm theme={theme} onCancel={() => navigate(-1)} />
      </div>
    </div>
  );
}
