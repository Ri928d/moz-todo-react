import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import {
  Register,
  Login,
  RequestPasswordReset,
  ConfirmPasswordReset,
} from "./components/Authentication";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import TodoApp from "./components/TodoApp";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<TodoApp />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<RequestPasswordReset />} />
            <Route path="/reset-password" element={<ConfirmPasswordReset />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<h2>404 Not Found</h2>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;