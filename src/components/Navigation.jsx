import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navigation() {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          Inventory Manager
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
              Home
            </NavLink>
          </li>

          {isLoggedIn ? (
            <>
              <li>
                <NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Inventory
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Profile
                </NavLink>
              </li>
              <li className="nav-user">
                <span className="nav-username">{username}</span>
                <button onClick={handleLogout} className="btn btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}