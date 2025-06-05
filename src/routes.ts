import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login/index";
import UsersList from "./pages/Users/";
import UsersCreateForm from "./pages/Users/UserCreateForm";
import Home from "./pages/Home";
import EntitiesList from "./pages/Entities/";
import EntitiesCreateForm from "./pages/Entities/EntitiesCreateForm";
import DirectoriesList from "./pages/Directories/";
import DirectoriesCreateForm from "./pages/Directories/DirectoriesCreateForm";
import WebSiteList from "./pages/Websites";
import WebSiteCreateForm from "./pages/Websites/WebSiteCreateForm";
import CategoriesList from "./pages/Categories";
import CategoriesCreateForm from "./pages/Categories/CategoriesCreateForm";
import PageList from "./pages/Pages/";
import PageCreateForm from "./pages/Pages/PageCreateForm";
const router = createBrowserRouter([
  {
    path: "/login",
    element: React.createElement(Login),
  },
  {
    path: "/dashboard",
    element: React.createElement(DashboardLayout),
    children: [
      {path: "home", element: React.createElement(Home)},
      { path: "users",
        children: [
          { path: "", element: React.createElement(UsersList) },
          { path: "create", element: React.createElement(UsersCreateForm) },
       ],
      },
      { path: "entities",
        children: [
          { path: "", element: React.createElement(EntitiesList) },
          { path: "create", element: React.createElement(EntitiesCreateForm) },
       ],
      },
      { path: "directories",
        children: [
          { path: "", element: React.createElement(DirectoriesList) },
          { path: "create", element: React.createElement(DirectoriesCreateForm) },
       ],
      },
      { path: "websites",
        children: [
          { path: "", element: React.createElement(WebSiteList) },
          { path: "create", element: React.createElement(WebSiteCreateForm) },
       ],
      },
      { path: "categories",
        children: [
          { path: "", element: React.createElement(CategoriesList) },
          { path: "create", element: React.createElement(CategoriesCreateForm) },
       ],
      },
      { path: "pages",
        children: [
          { path: "", element: React.createElement(PageList) },
          { path: "create", element: React.createElement(PageCreateForm) },
       ],
      }
    ],
  },
]);

export default router;
