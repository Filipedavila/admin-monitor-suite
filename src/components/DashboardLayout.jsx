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

  const propsDashboardMenu = {
    menuItems: [
      { id: "/dashboard/home", label: "Início", icon: "AMA-MenuCimaGrande-Line", url: "/dashboard/home" },
      { 
        id: "see", 
        label: "Ver/Gerir", 
        icon: "AMA-Visible-Line", 
        url: "/",
        submenu: [
          { id: "global", label: "Global", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/global" },
          { id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" },
          { id: "categories", label: "Categorias/Tags", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories" },
          { id: "entities", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities" },
          { id: "websites", label: "Sítio web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
          { id: "pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
          { id: "users", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users" },
          { id: "usersgov", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov" },
               {
            id: "crawler",
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
          { id: "directories/create", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories/create" },
          { id: "categories/create", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories/create" },
          { id: "entities/create", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities/create" },
          { id: "websites/create", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites/create" },
          { id: "pages/create", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages/create" },
          { id: "users/create", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users/create" },
          { id: "usersgov/create", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov/create" }
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
            id: "logs",
            label: "Logs",
            icon: "AMA-SiteAcessibilidade-Line",
            url: "/dashboard/logs"
          }
        ]
      },
      {
        id: "/dashboard/acessiblityDeclaration",
        label: "Declarações de Acessibilidade",
        icon: "AMA-DeclaracaoDark-Line",
        url: "/dashboard/acessiblityDeclaration"
      }
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
    setActiveItem(found ? found : "");
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
    <div className={`main-content-dashboard ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
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
             
              // Implement logout functionality here
              console.log("Logout clicked");
              navigate("/login"); // Redirect to login page after logout
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
        <DashboardMenu
          activeItem={activeItem}
          menuItems={propsDashboardMenu.menuItems}
          onMenuItemClick={handleMenuItemClick}
        />
      </aside>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
