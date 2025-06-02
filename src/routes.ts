import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login/index";
import Users from "./pages/Users";
import Home from "./pages/Home";

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
      { path: "users", element: React.createElement(Users) },
    ],
  },
]);

export default router;
