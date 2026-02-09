import { Outlet } from "react-router-dom";
import Header from "../partial/Header";

export default function HomeLayout() {

    return (
        <>
           
            <Outlet />
        </>
    )
}
