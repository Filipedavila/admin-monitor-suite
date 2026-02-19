import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardMenu, Breadcrumb, InputSearch, Button, Icon } from "ama-design-system";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo-header.svg"; 
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

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
      { 
        id: "see", 
        label: "Ver/Gerir", 
        icon: "AMA-Visible-Line", 
        url: "/",
        submenu: [
          { id: "/dashboard/global", label: "Global", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/global" },
          { id: "/dashboard/directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" },
          { id: "/dashboard/categories", label: "Categorias/Tags", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories" },
          { id: "/dashboard/entities", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities" },
          { id: "/dashboard/websites", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
          { id: "/dashboard/pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
          { id: "/dashboard/users", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users" },
          { id: "/dashboard/usersgov", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov" },
               {
            id: "/dashboard/crawler",
            label: "Crawlers",
            icon: "AMA-DownloadSetacurta-Line",
            url: "/dashboard/crawler",
          }
        ],
        activeItem: "/dashboard/home",
      },
      { 
        id: "create",
        label: "Criar",
        icon: "AMA-Mais-Line",
        url: "/dashboard/users/create",
        submenu: [
          { id: "/dashboard/directories/create", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories/create" },
          { id: "/dashboard/categories/create", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories/create" },
          { id: "/dashboard/entities/create", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities/create" },
          { id: "/dashboard/websites/create", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites/create" },
          { id: "/dashboard/pages/create", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages/create" },
          { id: "/dashboard/users/create", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users/create" },
          { id: "/dashboard/usersgov/create", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov/create" }
        ],
        activeItem: "home",
      },
      {
        id: "dev",
        label: "Ferramentas de programador",
        icon: "AMA-Opcao-Line",
        url: "/dashboard/statistics",
        submenu: [
          {
            id: "/dashboard/logs",
            label: "Logs",
            icon: "AMA-SiteAcessibilidade-Line",
            url: "/dashboard/logs"
          }
        ]
      }
     /* {
        id: "/dashboard/acessiblityDeclaration",
        label: "Declarações de Acessibilidade",
        icon: "AMA-DeclaracaoDark-Line",
        url: "/dashboard/acessiblityDeclaration"
      }*/
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


  const handleMenuItemClick = (id) => {
    setActiveItem(id);
    localStorage.setItem("activeMenuItem", JSON.stringify(id));
    if(id.submenu !== undefined) {
      return; 
    }
    navigate(typeof id === "object" ? id.url : id);
  };

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

      {
        (localStorage.getItem("@AMS:apiUrl") || "").includes("http://10.55.37.17")  ?
         <h2>AMS - <abbr title="Desenvolvimento">DEV</abbr></h2> :
        (localStorage.getItem("@AMS:apiUrl") || "").includes("https://accessmonitor.acessibilidade.gov.pt")
        ? <h2>AMS - <abbr title="Produção">PRD</abbr></h2>
        : <h2>AMS - <abbr title="Pré-produção">PPR</abbr></h2>
        }
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
