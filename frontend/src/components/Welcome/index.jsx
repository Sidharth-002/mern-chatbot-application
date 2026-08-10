import React, { useState, useEffect } from "react";
import Robot from "../../assets/hello.svg";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";
export default function Welcome() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  useEffect(() => {
    const storedUser = localStorage.getItem(
      process.env.REACT_APP_LOCALHOST_KEY,
    );
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      setUserName(JSON.parse(storedUser).username);
    } catch (error) {
      console.error("Failed to parse stored user", error);
      localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <div className="container">
        <img src={Robot} alt="Hello logo" />
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
      </div>
    </>
  );
}
