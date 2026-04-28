import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue chatting</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In ->"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
