import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { loginService } from "../services/auth.service";

export default function Signup() {
  const { setTitle } = useContext(ThemeContext);
  const { login } = useAuth();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle("Sign In");
  }, [setTitle]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginService({ mobile, password });
      login(res.data); // 🔥 real login
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid login-container" style={{ minHeight: "100vh" }}>
      <div className="row">
        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="w-100 px-lg-5 px-4 py-4" style={{ maxWidth: "420px" }}>
            <h3 className="mb-3 fw-bold">Welcome Back 👋</h3>
            <p className="text-muted mb-4">Login to your account to continue</p>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  className="form-control"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mt-4">
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6 d-none d-lg-block p-0 overflow-hidden">
          <img
            src="/assets/images/login-image.png"
            alt="Login"
            style={{ height: "100vh", width: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}
