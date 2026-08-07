import React from "react";
import { Routes, Route } from "react-router-dom";
import SetAvatar from "../components/SetAvatar";
import Chat from "../pages/Chat";
import Login from "../pages/Login";
import Register from "../pages/Register";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setAvatar" element={<SetAvatar />} />
      <Route path="/" element={<Chat />} />
    </Routes>
  );
}
