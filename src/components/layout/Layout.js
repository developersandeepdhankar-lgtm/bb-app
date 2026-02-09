import { Outlet } from "react-router-dom";
import Header from "../partial/Header";
import Breadcrumbs from "../partial/Breadcrumbs";
import Sidebar from "../partial/Sidebar";
import Footer from "../partial/Footer";

export default function Layout() {

    return (
        <>
            <Header />
            <Breadcrumbs />
            <div className="content-wrapper content-wrapper-radius d-flex">
                <Sidebar />
                <div className="content-area py-4">
                    <div className="container-fluid px-2 px-md-4">
                        <Outlet />
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    )
}
