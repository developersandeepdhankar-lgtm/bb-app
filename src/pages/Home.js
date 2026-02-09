import { useContext, useEffect, useRef, useState } from 'react'
import { ThemeContext } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { dashboardModules } from '../components/AppData';
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
     const { user } = useAuth();
    const { setTitle } = useContext(ThemeContext)
    useEffect(() => {
        setTitle('Admin Dashboard');
    }, [setTitle]);

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = today.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });
    const [Search, setSearch] = useState(true)
    const inputRef = useRef(null);


    useEffect(() => {

        const links = document.querySelectorAll(".animated-icon");

        links.forEach((link) => {
            const paths = link.querySelectorAll("svg path");

            paths.forEach((path) => {
                const length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = "0";

                link.addEventListener("mouseenter", () => {
                    path.style.transition = "none";
                    path.style.strokeDashoffset = length;
                    void path.getBoundingClientRect(); // force reflow
                    path.style.transition = "stroke-dashoffset 1s ease";
                    path.style.strokeDashoffset = "0";
                });
            });
        });

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearch(false);
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };

    }, []);

    return (
        <>
            <div className="page-heading  py-md-4 py-3" >
                <div className="container">
                    
                    <div className="page-welcome d-flex align-items-center justify-content-between" style={{ paddingBottom: '1rem' }}>
                        <div className="welcome-text">
                            <h1 className="mb-0 fw-light">Welcome back, <strong className="text-primary fw-bold">{user?.name || "User"}!</strong></h1>
                           
                        </div>
                        <div className="weather-info d-none d-md-flex gap-4 align-items-center">
                            <div className="d-flex align-items-start gap-1">
                                <span className="display-4 lh-1">🌤️ 31</span>
                                <span className="pt-2 d-flex">°C</span>
                            </div>
                            <div>
                                <p className="mb-1 fs-5" id="dayName">{dayName}</p>
                                <p className="mb-0" id="fullDate">{formattedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="page-search">
                        <div className="input-group mb-4">
                            <svg className="position-absolute top-50 translate-middle-y icon-search" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="var(--bs-gray-500)" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3.75 12.5C3.75 13.6491 3.97633 14.7869 4.41605 15.8485C4.85578 16.9101 5.5003 17.8747 6.31282 18.6872C7.12533 19.4997 8.08992 20.1442 9.15152 20.5839C10.2131 21.0237 11.3509 21.25 12.5 21.25C13.6491 21.25 14.7869 21.0237 15.8485 20.5839C16.9101 20.1442 17.8747 19.4997 18.6872 18.6872C19.4997 17.8747 20.1442 16.9101 20.5839 15.8485C21.0237 14.7869 21.25 13.6491 21.25 12.5C21.25 11.3509 21.0237 10.2131 20.5839 9.15152C20.1442 8.08992 19.4997 7.12533 18.6872 6.31282C17.8747 5.5003 16.9101 4.85578 15.8485 4.41605C14.7869 3.97633 13.6491 3.75 12.5 3.75C11.3509 3.75 10.2131 3.97633 9.15152 4.41605C8.08992 4.85578 7.12533 5.5003 6.31282 6.31282C5.5003 7.12533 4.85578 8.08992 4.41605 9.15152C3.97633 10.2131 3.75 11.3509 3.75 12.5Z" />
                                <path d="M26.25 26.25L18.75 18.75" />
                            </svg>
                            <input type="text" className={`form-control py-md-4 p-3 searchInput rounded-4`} ref={inputRef} onFocus={() => setSearch(false)} onBlur={() => setSearch(true)} id="searchInput" placeholder="Search here..." />
                            <div className="position-absolute top-50 translate-middle-y icon-cmd d-none d-md-block">
                                <span className="d-none opacity-0" id="searchToggleBtn"></span>
                                <span className="badge bg-body-secondary text-body">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10" />
                                    </svg>
                                </span>
                                {' '}
                                <span className="badge bg-body-secondary text-body ms-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 4l0 16" />
                                        <path d="M7 12h2l8 -8" />
                                        <path d="M9 12l8 8" />
                                    </svg>
                                </span>
                            </div>
                            <div className={`position-absolute search-result top-100 w-100 z-3 ${Search ? 'active' : ''}`}>
                                <div className="card rounded-4 p-xl-4">
                                    <div className="card-body">
                                        <small className="text-uppercase text-muted">Recent Searches</small>
                                        <div className="d-flex flex-wrap align-items-start mt-2 mb-4 gap-1 tag-hover">
                                            <Link
                                                className="small rounded py-1 px-3 rounded-pill fw-normal border-bg"
                                                style={{ "--dynamic-color": "var(--bs-dark)" }}
                                                to="#"
                                            >
                                                Onepage
                                            </Link>

                                            <Link className="small rounded py-1 px-3 rounded-pill fw-normal border-bg" style={{ "--dynamic-color": "var(--bs-primary)" }} to="#">Project</Link>
                                            <Link className="small rounded py-1 px-3 rounded-pill fw-normal border-bg" style={{ "--dynamic-color": "var(--bs-warning)" }} to="#">Add Product</Link>
                                            <Link className="small rounded py-1 px-3 rounded-pill fw-normal border-bg" style={{ "--dynamic-color": "var(--bs-info)" }} to="#">Create Invoice</Link>
                                            <Link className="small rounded py-1 px-3 rounded-pill fw-normal border-bg" style={{ "--dynamic-color": "var(--bs-primary)" }} to="#">Hospital Admin</Link>
                                        </div>
                                        <small className="text-uppercase text-muted">Suggestions:</small>
                                        <div className="list-group mt-2 rounded-4">
                                            <Link className="list-group-item list-group-item-action text-truncate" to="#" aria-label="Need a Help?">
                                                <div className="fw-bold">Need a Help?</div>
                                                <small className="text-muted">We're here to help you get the most out of your project.</small>
                                            </Link>
                                            <Link className="list-group-item list-group-item-action text-truncate" to="#" aria-label="Date Range Picker">
                                                <div className="fw-bold">Date Range Picker</div>
                                                <small className="text-muted">Originally created for reports at Improvely, the Date Range Picker</small>
                                            </Link>
                                            <Link className="list-group-item list-group-item-action text-truncate" to="#" aria-label="Image Input">
                                                <div className="fw-bold">Image Input</div>
                                                <small className="text-muted">Image input is an exclusive plugin of Good that enables a simple,</small>
                                            </Link>
                                            <Link className="list-group-item list-group-item-action text-truncate" to="#" aria-label="DataTables for jQuery">
                                                <div className="fw-bold">DataTables for jQuery</div>
                                                <small className="text-muted">This package contains distribution files for the DataTables library for jQuery</small>
                                            </Link>
                                            <Link className="list-group-item list-group-item-action text-truncate" to="#" aria-label="Components">
                                                <div className="fw-bold">Components</div>
                                                <small className="text-muted">Contrary to popular belief, Lorem Ipsum is not simply random text.</small>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="page-modules">
                <div className="container">
                    
                   
                    <ul className="list-unstyled d-flex justify-content-sm-start justify-content-between flex-wrap p-0 gap-xl-4 gap-md-3 gap-2 mt-3 li_animate">
                        {dashboardModules.map((item, key) => (
                            <li key={key} className="module-item position-relative">
                                <Link className="text-center animated-icon" to={item.link} aria-label={item.aria_label}>
                                    <div className="module-box rounded-4">
                                        {item.svg}
                                    </div>
                                    <h5 className="module-title mb-0 mt-2">{item.title}</h5>
                                </Link>
                                {item.topContent &&
                                    <span className={`align-items-center avatar d-flex fs-12 fw-bold justify-content-center md position-absolute px-4 rounded-3 shadow-sm bg-${item.topContentBg} text-${item.topContentColor}`} style={{ top: "-12px", right: "-12px" }}>{item.topContent}</span>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}