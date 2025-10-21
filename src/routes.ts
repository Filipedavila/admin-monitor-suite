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
import UsersGovList from "./pages/UsersGov";
import UsersGovCreateForm from "./pages/UsersGov/UsersGovCreateForm";
import ViewDirectories from "./pages/Directories/ViewDirectories";
import ViewWebSites from "./pages/Websites/ViewWebSite";
import ViewPages from "./pages/Pages/ViewPages";
import ViewCategories from "./pages/Categories/ViewCategories";
import GlobalDirectories from "./pages/GlobalDirectories/GlobalDirectories";
import CrawlerList from "./pages/Crawler";
import LogsList from "./pages/Logs";
import AccessibilityDeclarationList from "./pages/AccessiblityDeclaration";
import ViewEntities from "./pages/Entities/ViewEntities";
import DetailsPage from "./pages/Pages/DetailsPage";
import DetailsCrawler from "./pages/Crawler/DetailsCrawler";
import EvaluationWithErrors from "./pages/EvaluationWithErrors";
import WebsitesForUsers from "./pages/Users/WebsitesForUsers";
import PagesForUsers from "./pages/Users/PagesForUsers";
const router = createBrowserRouter([
  {
    path: "/login",
    element: React.createElement(Login),
  },
  {
    path: "/",
    element: React.createElement(Login),
  },
  {
    path: "/dashboard",
    element: React.createElement(DashboardLayout),
    children: [
      {path: "home", element: React.createElement(Home)},
      {path: "global", element: React.createElement(GlobalDirectories)},
      { path: "users",
        children: [
          { path: "", element: React.createElement(UsersList) },
          { path: "create", element: React.createElement(UsersCreateForm) },
          { path: "edit/:id", element: React.createElement(UsersCreateForm)},
          { path: "websites/:name", element: React.createElement(WebsitesForUsers)},
          { path: "websites/pages/:username/:name", element: React.createElement(PagesForUsers)}
       ],
      },
      { path: "entities",
        children: [
          { path: "", element: React.createElement(EntitiesList) },
          { path: "create", element: React.createElement(EntitiesCreateForm) },
          { path: "view/:entityName", element: React.createElement(ViewEntities)},
          { path: "edit/:id", element: React.createElement(EntitiesCreateForm)}
       ],
      },
      { path: "directories",
        children: [
          { path: "", element: React.createElement(DirectoriesList) },
          { path: "create", element: React.createElement(DirectoriesCreateForm) },
          { path: "view/:directoryName", element: React.createElement(ViewDirectories)},
          { path:"edit/:id", element: React.createElement(DirectoriesCreateForm)}
       ],
      },
      { path: "websites",
        children: [
          { path: "", element: React.createElement(WebSiteList) },
          { path: "create", element: React.createElement(WebSiteCreateForm) },
          { path: "view", element: React.createElement(ViewWebSites)},
          { path: "view/:id/:websiteName", element: React.createElement(ViewWebSites)},
          { path: "edit/:id", element: React.createElement(WebSiteCreateForm)}
       ],
      },
      { path: "categories",
        children: [
          { path: "", element: React.createElement(CategoriesList) },
          { path: "create", element: React.createElement(CategoriesCreateForm) },
          { path: "view/:categoryName", element: React.createElement(ViewCategories)},
          { path: "edit/:id", element: React.createElement(CategoriesCreateForm)}
       ],
      },
      { path: "pages",
        children: [
          { path: "", element: React.createElement(PageList) },
          { path: "create", element: React.createElement(PageCreateForm) },
          { path: "view", element: React.createElement(ViewPages)},
          { path: "view/:pageUrl", element: React.createElement(ViewPages)},
          { path: "details/:pageUrl/:id", element: React.createElement(DetailsPage)},
          { path: "edit/:id", element: React.createElement(PageCreateForm)}
       ],
      },
      { path: "usersgov",
        children: [
          { path: "", element: React.createElement(UsersGovList) },
          { path: "create", element: React.createElement(UsersGovCreateForm) },
          { path: "edit/:id", element: React.createElement(UsersGovCreateForm)}
       ],
      },
      { path: "crawler",
        children: [
          { path: "", element: React.createElement(CrawlerList) },
          { path: "details/:id/:websiteId", element: React.createElement(DetailsCrawler)}
       ],
      },
      {
        path:"logs",
        children: [
          {
            path: "",
            element:React.createElement(LogsList),
          },
        ],
      },
      {
        path: "acessiblityDeclaration",
        element: React.createElement(AccessibilityDeclarationList),
      },
      {
        path: "evaluation-with-errors/:type",
        element: React.createElement(EvaluationWithErrors),
      }
    ],
  },
], { basename: "/ams" });

export default router;
