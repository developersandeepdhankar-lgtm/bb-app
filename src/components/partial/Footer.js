import { Link } from "react-router-dom";

const Footer = () => {

    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="small mt-4">
                <div className="row g-3">
                    <div className="col-md-6">
                        <span>Copyright © {currentYear}<span id="currentYear"></span> <span className="fw-bold"><Link to="https://thememakker.com/" aria-label="Thememakker infotech LLP" target="_blank">ThemeMakker</Link></span> All rights reserved.</span>
                    </div>
                    <div className="col-md-6">
                        <div className="align-items-center d-flex justify-content-md-end">
                            <Link className="link-primary" to="/#" title="">Term &amp; Conditions</Link>
                            <span className="mx-2 text-muted"> | </span>
                            <Link className="link-primary" to="/#" title="">Privacy &amp; Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer