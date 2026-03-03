import './i18n';
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "ama-design-system/dist/index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  RadialLinearScale,
  ArcElement,
  Filler,
} from "chart.js";
import App from './App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  RadialLinearScale,
  ArcElement,
  Filler
);

ReactDOM.createRoot(document.getElementById("root")).render(
      <AuthProvider>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
);