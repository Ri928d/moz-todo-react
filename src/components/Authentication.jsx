import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  login as apiLogin,
  register as apiRegister,
  requestPasswordReset,
  confirmPasswordReset,
} from "../services/api";

const AuthForm = ({ onSubmit, fields, submitButtonText }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const arr = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${arr.join(", ")}`;
          })
          .join("; ");
        setError(errorMessages || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <p className="form-error">{error}</p>}
      {fields.map((field) => (
        <div key={field.name} className="form-field">
          <label htmlFor={`auth-${field.name}`}>{field.placeholder}</label>
          <input
            id={`auth-${field.name}`}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={handleChange}
            required={field.required}
          />
        </div>
      ))}
      <button type="submit" className="btn btn-primary btn-lg">
        {submitButtonText}
      </button>
    </form>
  );
};

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const data = await apiLogin(formData.username, formData.password);
    login(data.access, data.refresh, formData.username);
    navigate("/inventory");
  };

  const fields = [
    { name: "username", type: "text", placeholder: "Username", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];

  return (
    <div className="page-container auth-page">
      <h1>Login</h1>
      <AuthForm onSubmit={handleSubmit} fields={fields} submitButtonText="Login" />
      <p className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        {" · "}
        <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    await apiRegister(formData.username, formData.email, formData.password);
    const loginData = await apiLogin(formData.username, formData.password);
    login(loginData.access, loginData.refresh, formData.username);
    navigate("/inventory");
  };

  const fields = [
    { name: "username", type: "text", placeholder: "Username", required: true },
    { name: "email", type: "email", placeholder: "Email", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];

  return (
    <div className="page-container auth-page">
      <h1>Register</h1>
      <AuthForm onSubmit={handleSubmit} fields={fields} submitButtonText="Register" />
      <p className="auth-links">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const response = await requestPasswordReset(email);
      setStatus(response.message || "If the email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send reset email.");
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Reset Password</h1>
      {status && <div className="toast toast--success">{status}</div>}
      {error && <div className="toast toast--error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="reset-email">Email Address</label>
          <input
            id="reset-email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg">
          Send Reset Link
        </button>
      </form>
      <p className="auth-links">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export const ConfirmPasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    try {
      const response = await confirmPasswordReset(token, newPassword);
      setStatus(response.message || "Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to reset password.");
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Set New Password</h1>
      {status && <div className="toast toast--success">{status}</div>}
      {error && <div className="toast toast--error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="new-pw">New Password</label>
          <input
            id="new-pw"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirm-pw">Confirm Password</label>
          <input
            id="confirm-pw"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg">
          Update Password
        </button>
      </form>
    </div>
  );
};