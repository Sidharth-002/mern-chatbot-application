import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";
import SetAvatar from "../components/SetAvatar";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Chat />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
      </Route>
    </Routes>
  );
}
