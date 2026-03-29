import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div
      style={{
        padding: "40px",
        color: "black",
        background: "white",
        minHeight: "70vh",
      }}
    >
      <h1 style={{ marginBottom: "12px" }}>Inventory Management System</h1>
      <p style={{ maxWidth: "700px", fontSize: "18px", lineHeight: "1.6" }}>
        This application helps authenticated users manage inventory items,
        monitor stock levels, and identify low-stock products through a secure
        React and Django REST architecture.
      </p>

      {isLoggedIn ? (
        <div style={{ marginTop: "24px" }}>
          <p>
            Welcome back, <strong>{username}</strong>.
          </p>
          <Link
            to="/inventory"
            style={{
              display: "inline-block",
              marginTop: "12px",
              padding: "12px 18px",
              background: "#2e7d32",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Go to Inventory
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <Link
            to="/login"
            style={{
              padding: "12px 18px",
              background: "#1976d2",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              padding: "12px 18px",
              background: "#424242",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Register
          </Link>
        </div>
      )}

      <div
        style={{
          marginTop: "36px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          maxWidth: "1000px",
        }}
      >
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h3>Secure Access</h3>
          <p>User registration, login, and protected API routes using JWT authentication.</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h3>Inventory Tracking</h3>
          <p>Create, update, search, and delete stock items linked to the authenticated user.</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h3>Low Stock Monitoring</h3>
          <p>Monitor stock thresholds and quickly identify items that require attention.</p>
        </div>
      </div>
    </div>
  );
}