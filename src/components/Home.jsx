import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div className="page-container">
      <div className="hero">
        <h1 className="hero-title">Inventory Management System</h1>
        <p className="hero-subtitle">
          A full-stack enterprise application for tracking inventory, monitoring stock levels,
          and managing products — built with React, Django REST Framework, and PostgreSQL.
        </p>

        {isLoggedIn ? (
          <div className="hero-actions">
            <p className="welcome-text">
              Welcome back, <strong>{username}</strong>.
            </p>
            <Link to="/inventory" className="btn btn-primary btn-lg">
              Go to Inventory
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Register
            </Link>
          </div>
        )}
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Secure Authentication</h3>
          <p>
            JWT-based login and registration with password reset via email.
            Protected API routes ensure only authenticated users access inventory data.
          </p>
        </div>

        <div className="feature-card">
          <h3>Full CRUD Operations</h3>
          <p>
            Create, read, update, and delete inventory items. Edit inline,
            adjust stock levels, and manage item categories and descriptions.
          </p>
        </div>

        <div className="feature-card">
          <h3>Low Stock Monitoring</h3>
          <p>
            Set custom thresholds per item. Low-stock items are visually flagged
            and filterable so you can act before running out.
          </p>
        </div>

        <div className="feature-card">
          <h3>Search, Filter &amp; Sort</h3>
          <p>
            Find items by name, description, or category. Filter by stock status
            and sort by date, quantity, or alphabetically.
          </p>
        </div>

        <div className="feature-card">
          <h3>User Profiles</h3>
          <p>
            Manage account details and upload a profile image via Cloudinary.
            Each user sees only their own inventory data.
          </p>
        </div>

        <div className="feature-card">
          <h3>Enterprise Architecture</h3>
          <p>
            Clean three-layer separation: React frontend, Django REST middleware,
            and PostgreSQL database. Deployed on Render with environment-based configuration.
          </p>
        </div>
      </div>
    </div>
  );
}