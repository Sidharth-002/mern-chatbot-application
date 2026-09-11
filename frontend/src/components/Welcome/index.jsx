import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Robot from "../../assets/hello.svg";
import "./Welcome.css";

export default function Welcome() {
  const { state } = useContext(AuthContext);
  return (
    <>
      <div className="container-welcome">
        <img src={Robot} alt="Hello logo" />
        <h1>
          Welcome, <span>{state?.user?.username}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
      </div>
    </>
  );
}
