import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardMenu, Breadcrumb, InputSearch, Button, Icon } from "ama-design-system";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo-header.svg"; 
import { useTheme } from "../context/ThemeContext";

const DashboardLayout = () => {

  const [activeItem, setActiveItem] = useState("home");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const propsDashboardMenu = {
    menuItems: [
      { id: "/dashboard/home", label: "Home", icon: "AMA-Casa-Line", url: "/dashboard/home" },
      { 
        id: "see", 
        label: "Ver/Gerir", 
        icon: "AMA-Visible-Line", 
        url: "/",
        submenu: [
          { id: "global", label: "Global", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/global" },
          { id: "categories", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories" },
          { id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" },
          { id: "users", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users" },
          { id: "entities", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities" },
          { id: "websites", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
          { id: "pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
          { id: "usersgov", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov" },
        ],
        activeItem: "home",
      },
      { 
        label: "Criar",
        icon: "AMA-Mais-Line",
        url: "/dashboard/users/create",
        submenu: [
          { id: "categories/create", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories/create" },
          { id: "directories/create", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories/create" },
          { id: "users/create", label: "Utilizadores", icon: "AMA-Pessoa-Line", url: "/dashboard/users/create" },
          { id: "entities/create", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities/create" },
          { id: "websites/create", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites/create" },
          { id: "pages/create", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages/create" },
          { id: "usersgov/create", label: "Utilizadores Gov", icon: "AMA-DuasPessoas-Line", url: "/dashboard/usersgov/create" },
        ],
        activeItem: "home",
      }
    ]
  };

  const handleMenuItemClick = (id) => {
    console.log(`Menu item clicked: ${id}`);
    setActiveItem(id);
    navigate(typeof id === "object" ? id.url : id);
  };

  return (
    <div className={`main-content-dashboard ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <a href="#main-content" className="skip-to-content">Pular para o conteúdo</a>
      <header className="d-flex justify-content-between gap-5 align-items-center">
        <div className="d-flex align-items-center gap-3">
          <img src={Logo} alt="AdminMonitorSuite Logo" className="logo"/>
        </div>

        <div className="d-flex gap-3 align-items-center">
          <Button
            text={theme === 'dark' ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
            iconRight={<Icon
              name={theme === 'dark' ? "AMA-Claro-Line" : "AMA-Escuro-Line"}
              size={16}
              className="icon-right"
            />}
          />

          <Button
            text="Português"
            onClick={() => {
              console.log("Sair clicked");
              // Implement logout logic here
            }}
            iconRight={<Icon
              name="AMA-Globo-Line"
              size={16}
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
