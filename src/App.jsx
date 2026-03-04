import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RTLogin, AgentLeaderboard } from "./assets/main-components/index";
import { PublicRoute, ProtectedRoute } from "./assets/common-components/index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <RTLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AgentLeaderboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
