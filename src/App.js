import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./components/layout/Login";
import HomeLayout from "./components/layout/HomeLayout";
import Layout from "./components/layout/Layout";

import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Role from "./pages/Role";
import IncentiveRules from "./pages/IncentiveRules"; 
import Users from "./pages/Users";
import States from "./pages/StateMaster";
import Districts from "./pages/DistrictMaster";
import Pincodes from "./pages/PincodeMaster";
import StateTarget from "./pages/StateTargetSummary";
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* 🔓 LOGIN */}
          <Route element={<PublicRoute />}>
            <Route element={<Login />}>
              <Route path="/" element={<Signup />} />
            </Route>
          </Route>

          {/* 🔐 DASHBOARD */}
          <Route element={<ProtectedRoute />}>
            <Route element={<HomeLayout />}>
              <Route path="/dashboard" element={<Home />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/role" element={<Role />} />

              {/* ✅ INCENTIVE RULES */}
              <Route
                path="/incentive-rules"
                element={<IncentiveRules />}
              />
               <Route path="/users" element={<Users />} />

                <Route path="/states" element={<States />} />
                <Route path="/districts" element={<Districts />} />
                <Route path="/pincodes" element={<Pincodes />} />
                <Route path="/state-targets" element={<StateTarget />} />
            </Route>
           
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
