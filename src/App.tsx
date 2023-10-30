// App.tsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Define other routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
