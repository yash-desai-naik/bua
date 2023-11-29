// App.tsx
//@ts-nocheck// App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./Login";
import { useLoginStore } from "./loginStore";
// import Dashboard from "./Dashboard";
import Dashboard from "./Dash";
// import Dashboard from "./PPT";

function App() {
  const isAuthenticated = useLoginStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          // <Dashboard />
          <Route path="/" element={<LoginPage />} />
        )}
        {/* Define other routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
