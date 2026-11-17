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
import DetailsPageUsers from "./pages/Users/DetailsPageUsers";
import DetailedPageLine from "./pages/Pages/DetailedPageLine";
import TeamsList from "./pages/Teams/";
import TeamsCreateForm from "./pages/Teams/TeamsCreateForm";
import TeamUsers from "./pages/Teams/TeamUsers";
import TeamWebsites from "./pages/Teams/TeamWebsites";
import ChangePasswordPage from "./pages/ChangePassword";
import RequirePermission from "./components/RequirePermission";

// Wraps a page in a permission guard (canCreate / canEdit) so read-only users cannot open forms by URL.
const guarded = (Component, permission) =>
  React.createElement(RequirePermission, { permission }, React.createElement(Component));
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
      {path: "change-password", element: React.createElement(ChangePasswordPage)},
      { path: "users",
        children: [
          { path: "", element: React.createElement(UsersList) },
          { path: "create", element: guarded(UsersCreateForm, "canCreate") },
          { path: "edit/:id", element: guarded(UsersCreateForm, "canEdit")},
          { path: "websites/:name", element: React.createElement(WebsitesForUsers)},
          { path: "websites/pages/:username/:name", element: React.createElement(PagesForUsers)},
          { path: "websites/pages/details/:id/:username/:name/:pageUrl", element: React.createElement(DetailsPageUsers)}
       ],
      },
      { path: "entities",
        children: [
          { path: "", element: React.createElement(EntitiesList) },
          { path: "create", element: guarded(EntitiesCreateForm, "canCreate") },
          { path: "view/:entityName", element: React.createElement(ViewEntities)},
          { path: "edit/:id", element: guarded(EntitiesCreateForm, "canEdit")}
       ],
      },
      { path: "directories",
        children: [
          { path: "", element: React.createElement(DirectoriesList) },
          { path: "create", element: guarded(DirectoriesCreateForm, "canCreate") },
          { path: "view/:directoryName", element: React.createElement(ViewDirectories)},
          { path: "edit/:id", element: guarded(DirectoriesCreateForm, "canEdit")}
       ],
      },
      { path: "websites",
        children: [
          { path: "", element: React.createElement(WebSiteList) },
          { path: "create", element: guarded(WebSiteCreateForm, "canCreate") },
          { path: "view", element: React.createElement(ViewWebSites)},
          { path: "view/:id/:websiteName", element: React.createElement(ViewWebSites)},
          { path: "edit/:id", element: guarded(WebSiteCreateForm, "canEdit")}
       ],
      },
      { path: "categories",
        children: [
          { path: "", element: React.createElement(CategoriesList) },
          { path: "create", element: guarded(CategoriesCreateForm, "canCreate") },
          { path: "view/:categoryName", element: React.createElement(ViewCategories)},
          { path: "edit/:id", element: guarded(CategoriesCreateForm, "canEdit")}
       ],
      },
      { path: "pages",
        children: [
          { path: "", element: React.createElement(PageList) },
          { path: "create", element: guarded(PageCreateForm, "canCreate") },
          { path: "view", element: React.createElement(ViewPages)},
          { path: "view/:pageUrl", element: React.createElement(ViewPages)},
          { path: "details/:pageUrl/:id", element: React.createElement(DetailsPage)},
          { path: "detailed/:pageUrl/:details/:idPage", element: React.createElement(DetailedPageLine)},
          { path: "edit/:id", element: guarded(PageCreateForm, "canEdit")},
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
      },
      { path: "teams",
        children: [
          { path: "", element: React.createElement(TeamsList) },
          { path: "create", element: guarded(TeamsCreateForm, "canCreate") },
          { path: "edit/:id", element: guarded(TeamsCreateForm, "canEdit") },
          { path: ":id/users", element: React.createElement(TeamUsers) },
          { path: ":id/websites", element: React.createElement(TeamWebsites) },
        ],
      },
    ],
  },
], { basename: "/ams" });

export default router;
