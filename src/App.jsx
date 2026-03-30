import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import {
  Register,
  Login,
  RequestPasswordReset,
  ConfirmPasswordReset,
} from "./components/Authentication";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import InventoryApp from "./components/InventoryApp";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <InventoryApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<RequestPasswordReset />} />
              <Route path="/reset-password" element={<ConfirmPasswordReset />} />
              <Route path="*" element={<div className="page-container"><h2>404 — Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;