import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';

export default function Sidebar() {

    const location = useLocation()
    const urlPath = location.pathname

    const { sidebarToggle } = useContext(ThemeContext)

    const menuItem = [
        {
            link: "My Dashboard",
            children: [
                {
                    link: "Analytics",
                    url: "/analytics"
                },
                {
                    link: "Project",
                    url: "#"
                },
                {
                    link: "Events",
                    url: "#"
                },
                {
                    link: "My Wallet",
                    url: "#"
                }
            ]
        },
        {
            link: "eCommerce",
            children: [
                {
                    link: "Analytics",
                    url: "#"
                },
                {
                    link: "Customers",
                    url: "#"
                },
                {
                    link: "Comments",
                    url: "#"
                },
                {
                    link: "Transactions",
                    url: "#"
                }
            ]
        },
        {
            link: "HRMS",
            children: [
                {
                    link: "Analytics",
                    url: "#"
                },
                {
                    link: "Employee",
                    url: "#"
                },
                {
                    link: "Attendance",
                    url: "#"
                },
                {
                    link: "Departments",
                    url: "#"
                },
                {
                    link: "Trip",
                    url: "#"
                },
                {
                    link: "Leave",
                    url: "#"
                },
                {
                    link: "Office Staff",
                    url: "#"
                },
                {
                    link: "Payslips",
                    url: "#"
                },
                {
                    link: "Employee Salary",
                    url: "#"
                },
                {
                    link: "Holidays",
                    url: "#"
                }
            ]
        },
        {
            link: "Hospital",
            children: [
                {
                    link: "Analytics",
                    url: "#"
                },
                {
                    link: "Patient Management",
                    url: "#"
                },
                {
                    link: "Appointments",
                    url: "#"
                },
                {
                    link: "Doctors & Staff",
                    url: "#"
                },
                {
                    link: "Pharmacy & Inventory",
                    url: "#"
                },
                {
                    link: "Laboratory & Diagnostics",
                    url: "#"
                },
                {
                    link: "Reports & Compliance",
                    url: "#"
                },
                {
                    link: "Billing & Finance",
                    url: "#"
                }
            ]
        },
        {
            link: "Crypto",
            children: [
                {
                    link: "Analytics",
                    url: "#"
                },
                {
                    link: "User Management",
                    url: "#"
                },
                {
                    link: "Wallets",
                    url: "#"
                },
                {
                    link: "Transactions",
                    url: "#"
                },
                {
                    link: "Trading",
                    url: "#"
                },
                {
                    link: "Reports",
                    url: "#"
                },
                {
                    link: "Compliance",
                    url: "#"
                },
                {
                    link: "Settings",
                    url: "#"
                }
            ]
        },
        {
            link: "Finance",
            children: [
                {
                    link: "Invoicing",
                    url: "#"
                },
                {
                    link: "Expenses",
                    url: "#"
                }
            ]
        },
        {
            link: "Authentication",
            children: [
                {
                    link: "Sign In",
                    url: "#"
                },
                {
                    link: "Sign Up",
                    url: "#"
                },
                {
                    link: "Forgot Password",
                    url: "#"
                },
                {
                    link: "Verification Code",
                    url: "#"
                },
                {
                    link: "Error page",
                    url: "#"
                }
            ]
        }
    ]

    return (
        <>
            <aside className="left-sidebar border-end z-2">
                <nav className="nav-sidebar">
                    <ul className="list-unstyled mb-0">
                        {menuItem.map((item, key) => {
                            const collapseId = `collapse-${key}`
                            const isOpenByDefault = item.link === "My Dashboard" || item.link === "Authentication";
                            return (
                                <li key={key}>
                                    <Link className={`d-flex align-items-center justify-content-between hover-svg ${isOpenByDefault ? "" : "collapsed"}`} data-bs-toggle="collapse" to={`#${collapseId}`} role="button" aria-expanded={isOpenByDefault ? "true" : "false"} aria-controls={collapseId}>
                                        <span className="nav-title fs-18 fw-medium">{item.link}</span>
                                        <svg className="opacity-75" width="18" height="18" strokeWidth="0.5" viewBox="0 0 21 21" fill="none" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.5 4.375V16.625" />
                                            <path d="M4.375 10.5H16.625" />
                                        </svg>
                                    </Link>
                                    <div className={`collapse ${isOpenByDefault ? "show" : ""}`} id={collapseId} >
                                        <ul className="nav flex-column">
                                            {item.children.map((res, key) => (
                                                <li className="nav-item" key={key}>
                                                    <Link className={`nav-link ${urlPath === res.url ? 'active' : ''}`} to={res.url}>
                                                        {res.link}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>
            <div className="sidebar-overlay" onClick={() => sidebarToggle()}></div>
        </>
    )
}