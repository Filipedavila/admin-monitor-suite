import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardMenu, Button, Icon } from "@a12e/accessmonitor-ds";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-header.svg"; 
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import SessionInfo from "./SessionInfo";
import ChangePassword from "./ChangePassword";
import Toasts from "./Toasts";

const DashboardLayout = () => {

  const [activeItem, setActiveItem] = useState(JSON.parse(localStorage.getItem("activeMenuItem")) || "/dashboard/home");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(
    JSON.parse(localStorage.getItem("@AMS:menuCollapsed") || "false")
  );

  const toggleMenu = () => {
    const next = !isMenuCollapsed;
    setIsMenuCollapsed(next);
    localStorage.setItem("@AMS:menuCollapsed", JSON.stringify(next));
  };

  const propsDashboardMenu = {
    menuItems: [
      { id: "/dashboard/home", label: "Início", icon: "AMA-MenuCimaGrande-Line", url: "/dashboard/home" },
      { id: "/dashboard/global", label: "Global", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/global" },
      { id: "/dashboard/directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" },
      { id: "/dashboard/categories", label: "Categorias/Tags", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories" },
      { id: "/dashboard/entities", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities" },
      { id: "/dashboard/websites", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
      { id: "/dashboard/pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
      { id: "/dashboard/users", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users" },
      { id: "/dashboard/teams", label: "Equipas", icon: "AMA-DuasPessoas-Line", url: "/dashboard/teams" },
      { id: "/dashboard/crawler", label: "Crawlers", icon: "AMA-DownloadSetacurta-Line", url: "/dashboard/crawler" },
      { id: "/dashboard/logs", label: "Logs", icon: "AMA-SiteAcessibilidade-Line", url: "https://10.55.37.16/grafana" },
    ]
  };

  useEffect(() => {
    // Find the menu or submenu item whose url matches the current path
    let found = propsDashboardMenu.menuItems.find(item => item.url === location.pathname);
    if (!found) {
      propsDashboardMenu.menuItems.forEach(item => {
        if (item.submenu) {
          const sub = item.submenu.find(sub => sub.url === location.pathname);
          if (sub) found = sub;
        } 
      });
    }
    setActiveItem(found ? found.id : "");
  }, [location.pathname]);

  // Fix for Issue #68: Remove default checked attribute from header checkboxes
  // The ama-design-system has a bug where the "All" checkbox is checked by default
  useEffect(() => {
    const fixHeaderCheckboxes = () => {
      const headerCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
      headerCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          checkbox.checked = false;
          checkbox.removeAttribute('checked');
        }
      });
    };
    
    // Run fix after DOM updates
    const timeoutId = setTimeout(fixHeaderCheckboxes, 200);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);


  // O menu do design system renderiza <a href="{basename}{id}"> para todos os itens. Para itens com
  // URL absoluta (Logs/Grafana) esse href é uma rota que não existe, por isso o clique é intercetado
  // (ainda antes do React) e o URL externo abre numa nova janela, sem navegar a app.
  useEffect(() => {
    const externalItems = propsDashboardMenu.menuItems.filter((item) => /^https?:\/\//i.test(item.url ?? ""));
    if (externalItems.length === 0) return undefined;
    const onClick = (event) => {
      if (event.button !== 0 && event.type !== "auxclick") return;
      const link = event.target instanceof Element ? event.target.closest("aside a[href]") : null;
      if (!link) return;
      const item = externalItems.find((candidate) => link.getAttribute("href")?.endsWith(candidate.id));
      if (!item) return;
      event.preventDefault();
      event.stopPropagation();
      window.open(item.url, "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  const handleMenuItemClick = (id) => {
    setActiveItem(id);
    localStorage.setItem("activeMenuItem", JSON.stringify(id));
    if(id.submenu !== undefined) {
      return; 
    }
    navigate(typeof id === "object" ? id.url : id);
  };

  const apiUrl = localStorage.getItem("@AMS:apiUrl") || "";
  const environmentLabel = apiUrl.includes("http://10.55.37.16")
    ? { abbr: "DEV", title: "Desenvolvimento" }
    : apiUrl.includes("http://10.55.37.17")
      ? { abbr: "PPR", title: "Pré-produção" }
      : apiUrl.includes("https://accessmonitor.acessibilidade.gov.pt")
        ? { abbr: "PRD", title: "Produção" }
        : null;

  return (
    <div className={`main-content-dashboard ${theme === 'dark' ? 'dark-theme' : 'light-theme'} ${isMenuCollapsed ? 'menu-collapsed' : ''}`}>
      <a href="#main-content" className="skip-to-content">Saltar para o conteúdo</a>
      <header className="d-flex justify-content-between gap-5 align-items-center">
        <div className="d-flex align-items-center gap-3">

          <img src={Logo} alt="AdminMonitorSuite Logo" className="logo"/>
     
        </div>

        <div className="d-flex gap-3 align-items-center">
          <Button
            text={theme === 'dark' ? "Modo claro" : "Modo escuro"}
            onClick={toggleTheme}
            darkTheme={theme}
            iconRight={<Icon
            name={"AMA-EscuroClaro-Line"}
            size={16}
            className="icon-right"
            />}
          />

          <Button
            text={i18n.language === "pt" ? "English" : "Português"}
            darkTheme={theme}
            onClick={() => {
              i18n.changeLanguage(i18n.language === "en" ? "pt" : "en");
              window.location.reload();
            }}
            iconRight={<Icon
              name="AMA-Globo-Line"
              size={16}
              className="icon-right"
            />}
          />

          <Button
            text={"Sair"}
            darkTheme={theme}
            onClick={() => {
              localStorage.removeItem('@AMS:user');
              localStorage.removeItem('@AMS:token');
              localStorage.removeItem('@AMS:authorizationLevel');
              localStorage.removeItem('@AMS:amsEnv');
              navigate("/login");
            }}
            iconRight={<Icon
              size={16}
              name="AMA-Exit-Line"
              className="icon-right"
            />}
          />
        </div>
      </header>
      <aside>

        {environmentLabel && (
          <h2>
            AMS - <abbr title={environmentLabel.title}>{environmentLabel.abbr}</abbr>
          </h2>
        )}
        {/* The sidebar background is always dark, so the button uses the DS dark variant. */}
        <SessionInfo userAction={<ChangePassword theme="dark" size="sm" />} />
        <DashboardMenu
          basename="/ams"
          activeItem={activeItem}
          menuItems={propsDashboardMenu.menuItems}
          onMenuItemClick={handleMenuItemClick}
        />
      </aside>
      <main id="main-content">
      <Button
            aria-label={isMenuCollapsed ? "Expandir menu" : "Colapsar menu"}
            text={isMenuCollapsed ? "Menu" : "Menu"}
            onClick={toggleMenu}
            darkTheme={theme}
            iconLeft  ={<Icon
              name={"AMA-ListaPonto-Line"}
              size={16}
              className="icon-right"
            />}
          />
        <Outlet />
      </main>
      <Toasts />
      <footer className="app-footer p-4">
        <div className="footer-inner d-flex flex-column justify-content-between align-items-center">
          <strong>AdminMonitorSutie v.1.0.1</strong>
          <span>© {new Date().getFullYear()} Agência para a Reforma Tecnológica do Estado, I.P.</span>

        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
