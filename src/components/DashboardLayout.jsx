import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardMenu } from "ama-design-system";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-header.svg"; 

const DashboardLayout = () => {
  
  const [activeItem, setActiveItem] = useState("home");
  const navigate = useNavigate();

  const propsDashboardMenu = {
    menuItems: [
      { id: "home", label: "Home", icon: "AMA-Casa-Line", url: "/" },
      { 
        id: "see", 
        label: "Ver/Gerir", 
        icon: "AMA-Casa-Line", 
        url: "/",
        submenu: [
          { id: "categories", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories" },
          { id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" },
          { id: "users", label: "Utilizadores", icon: "AMA-Casa-Line", url: "/dashboard/users" },
          { id: "entities", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities" },
          { id: "websites", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
          { id: "pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
        ],
        activeItem: "home",
      },
         { 
        id: "create", 
        label: "Criar", 
        icon: "AMA-Casa-Line", 
        url: "/dashboard/users/create",
        submenu: [
          { id: "categories/create", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/categories/create" },
          { id: "directories/create", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories/create" },
          { id: "users/create", label: "Utilizadores", icon: "AMA-Casa-Line", url: "/dashboard/users/create" },
          { id: "entities/create", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entities/create" },
          { id: "websites/create", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites/create" },
          { id: "pages/create", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages/create" },
        ],
        activeItem: "home",
      }
  ]
};


  const handleMenuItemClick = (id) => {
    console.log(`Menu item clicked: ${id}`);
    setActiveItem(id);
    navigate(id);
  };

  return (
    <div className="main-content-dashboard">
      <header>
      <img src={Logo} alt="Logo" className="login-logo" />

      </header>
      <aside>
        <DashboardMenu
          activeItem={activeItem}
          menuItems={propsDashboardMenu.menuItems}
          onMenuItemClick={handleMenuItemClick}
        />
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
