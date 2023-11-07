// App.tsx
//@ts-nocheck// App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./Login";
import { useLoginStore } from "./loginStore";
import Dashboard from "./Dashboard";
// import { PrimeReactProvider } from "primereact/api";
// import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
// import "primeflex/primeflex.css"; // css utility
// import "primeicons/primeicons.css";

function App() {
  const isAuthenticated = useLoginStore((state) => state.isAuthenticated);

  return (
    // <PrimeReactProvider>
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <Route path="/dashboard" element={<Dashboard bu={"BU-A"} />} />
        ) : (
          // <Dashboard />
          <Route path="/" element={<LoginPage />} />
        )}
        {/* Define other routes as needed */}
      </Routes>
    </BrowserRouter>
    // </PrimeReactProvider>
  );
}

export default App;
