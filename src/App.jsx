import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RTLogin, AgentLeaderboard } from "./assets/main-components/index";
import { PublicRoute, ProtectedRoute } from "./assets/common-components/index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <RTLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/leadership-dashboard"
          element={
            <ProtectedRoute>
              <AgentLeaderboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
