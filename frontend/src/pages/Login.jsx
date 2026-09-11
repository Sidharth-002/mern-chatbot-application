import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import apiClient from "../utils/apiClient";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";
import { toastOptions } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const { dispatch } = useContext(AuthContext);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await apiClient.post(loginRoute, values);
      if (!data?.status) {
        toast.error(data?.msg || "Login failed", toastOptions);
        return;
      }

      dispatch({
        type: "LOGIN",
        payload: { user: data.user, token: data.accessToken },
      });
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.msg || err.message || "Login failed";
      toast.error(msg, toastOptions);
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
              <h1>KC Bot</h1>
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
