import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardMenu } from "ama-design-system";
import Logo from "../assets/logo-header.svg"; 

const DashboardLayout = () => {
  const [activeItem, setActiveItem] = useState("home");

  const propsDashboardMenu = {
    menuItems: [
      { id: "home", label: "Home", icon: "AMA-Casa-Line", url: "/" },
      { id: "analytics", label: "Categorias", icon: "AMA-MarcadorGrande-Line", url: "/dashboard/analytics" },
      { id: "settings", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/settings" },
      { id: "profile", label: "Utilizadores", icon: "AMA-Casa-Line", url: "/dashboard/profile" },
      { id: "entity", label: "Entidades", icon: "AMA-Edificio-Line", url: "/dashboard/entity" },
      { id: "websites", label: "Sítios web", icon: "AMA-Globo-Line", url: "/dashboard/websites" },
      { id: "pages", label: "Páginas", icon: "AMA-Paginas-Line", url: "/dashboard/pages" },
    ],
    activeItem: "home",
  };

  const handleMenuItemClick = (id, url) => {
    setActiveItem(id);
  };

  return (
    <div className="main-content">
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
