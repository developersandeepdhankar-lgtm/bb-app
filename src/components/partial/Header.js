import { useContext } from "react";
import logo from "../../assets/images/logo.svg";
import profile from "../../assets/images/profile.png";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";


export default function Header() {
  const { logout } = useAuth();
  const { user } = useAuth();
  const homeUrl = useLocation().pathname === "/";
  const {
    bsTheme,
    changeBsTheme,
    title,
  } = useContext(ThemeContext);

  return (
    <>
      <header className="header sticky-top" id="header">
        <div className="container-fluid px-2 px-md-4">
          <div className="d-flex align-items-center justify-content-between py-md-3 py-2">

            {/* LOGO */}
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="Logo" className="img-fluid" />
                <small className="d-block text-uppercase text-secondary">
                  {title}
                </small>
              </Link>
            </div>

            <ul className="nav ms-auto align-items-center gap-3">

              {/* ✅ THEME DROPDOWN (FIXED) */}
              <li className="nav-item dropdown">
                <button
                  className="btn p-0 border-0 bg-transparent dropdown-toggle"
                  id="bd-theme"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                    <svg class="theme-icon-active" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><use href="#sun-fill"></use></svg>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <use
                      href={
                        bsTheme === "light"
                          ? "#sun-fill"
                          : bsTheme === "dark"
                          ? "#moon-stars-fill"
                          : "#circle-half"
                      }
                    />
                  </svg>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow rounded-4 p-2">
                  <li>
                    <button
                      className={`dropdown-item ${bsTheme === "light" ? "active" : ""}`}
                      onClick={() => changeBsTheme("light")}
                    >
                      Light
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item ${bsTheme === "dark" ? "active" : ""}`}
                      onClick={() => changeBsTheme("dark")}
                    >
                      Dark
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item ${bsTheme === "auto" ? "active" : ""}`}
                      onClick={() => changeBsTheme("auto")}
                    >
                      Auto
                    </button>
                  </li>
                </ul>
              </li>

              {/* ✅ PROFILE DROPDOWN (ALREADY OK) */}
              <li className="nav-item dropdown">
                <button
                  className="btn dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={profile}
                    width="30"
                    height="30"
                    className="rounded-circle"
                    alt="Profile"
                  />
                  <span className="d-none d-lg-block"> {user?.name || "User"}</span>
                </button>

                <div className="dropdown-menu dropdown-menu-end shadow rounded-4 p-3">
                    <div class="card-body">
                        <h5 class="mb-1"> {user?.name || "User"}</h5>
                        <p>{user?.email || "User"}</p>
                         <a
                            href="/"
                            className="btn btn-primary text-uppercase w-100 rounded-pill"
                            onClick={(e) => {
                                e.preventDefault(); // 🔥 stop page reload
                                logout();           // 🔥 real logout
                            }}
                            >
                            Sign out
                        </a>
                    </div>
                  <Link className="dropdown-item" to="/settings">
                    Settings
                  </Link>
                  <Link className="dropdown-item" to="/todo">
                    My Todo
                  </Link>
                  
                </div>
              </li>

            </ul>
          </div>
        </div>
      </header>

      {/* SVG SYMBOLS (UNCHANGED) */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="sun-fill" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
        </symbol>
        <symbol id="moon-stars-fill" viewBox="0 0 24 24">
          <path d="M12 3a9 9 0 1 0 9 9" />
        </symbol>
        <symbol id="circle-half" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
        </symbol>
      </svg>
    </>
  );
}
