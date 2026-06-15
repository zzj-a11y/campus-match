import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ToastContainer from "./components/ToastContainer";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <App />
          <ToastContainer />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>
);
