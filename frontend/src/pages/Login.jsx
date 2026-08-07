import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import "./Login.css";
import { toastOptions } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { data } = await axios.post(loginRoute, values);
    if (data.status === false) {
      console.log(data);
      toast.error(data.msg, toastOptions);
    }
    if (data.status === true) {
      localStorage.setItem(
        process.env.REACT_APP_LOCALHOST_KEY,
        JSON.stringify(data.user),
      );

      navigate("/");
    }
  };

  return (
    <>
      <div className="login-page">
        <div className="form-container">
          <form
            className="form"
            action=""
            onSubmit={(event) => handleSubmit(event)}
          >
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>Doddi Bot</h1>
            </div>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={(e) => handleChange(e)}
            />
            <button type="submit">Log In</button>
            <span className="auth-text">
              Don't have an account ? <Link to="/register">Create One.</Link>
            </span>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
