import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import MainPage from "./pages/MainPage";
import NavBar from "./components/NavBar";
import AddActionPage from "./pages/AddActionPage"; // skapa denna om du inte gjort det

import { ThemeProvider, CssBaseline } from "@mui/material";
import { appTheme } from "./theme/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <NavBar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/AddActionPage" element={<AddActionPage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
