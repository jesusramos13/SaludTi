/* eslint-disable */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { protectedRoutes, publicRoutes } from "./Routes";

import Login from "../pages/Login/Login";

const Authmiddleware = () => {
  const isAuthenticated = false; // Replace with actual authentication logic

  let token = null;

  token = localStorage.getItem("token"); //get token from local storage

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token from local storage
    window.location.reload(); // Reload the page to reflect changes
  };

  return (
    <BrowserRouter>
      <div>
        {token && (
          <button
            onClick={handleLogout}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            Logout
          </button>
        )}
      </div>
      <Routes>
        {/* <!-- ========== Start non authenticated route Section ========== --> */}
        {!token &&
          publicRoutes.map((routename, index) => (
            <Route
              path={routename.path}
              element={<routename.component />}
              exact
              key={index}
            />
          ))}
        {/* <!-- ========== End non authenticated route Section ========== --> */}

        {/* <!-- ========== Start authenticated route Section ========== --> */}
        {token &&
          protectedRoutes.map((routename, index) => (
            <Route
              path={routename.path}
              element={<routename.component />}
              exact
              key={index}
            />
          ))}
        {/* <!-- ========== End authenticated route Section ========== --> */}

        {/* <!-- ========== Start default redirect logic ========== --> */}
        <Route
          path="*"
          element={
            token ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
          }
          
        />
        {/* <!-- ========== End default redirect logic ========== --> */}
      </Routes>
    </BrowserRouter>
  );
};

export default Authmiddleware;
