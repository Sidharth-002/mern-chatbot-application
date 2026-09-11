import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";
import apiClient from "../utils/apiClient";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Register.css";
import { toastOptions } from "../utils/toast";

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { dispatch } = useContext(AuthContext);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await apiClient.post(registerRoute, values);
      if (!data.status) {
        toast.error(data.msg || "Registration failed", toastOptions);
        return;
      }
      dispatch({
        type: "LOGIN",
        payload: { user: data.user, token: data.accessToken },
      });
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.msg || err.message || "Registration failed";
      toast.error(msg, toastOptions);
    }
  };

  return (
    <>
      <div className="register-page">
        <form
          action=""
          className="register-form"
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
            type="email"
            placeholder="Email"
            name="email"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Create User</button>
          <span>
            Already have an account ? <Link to="/login">Login.</Link>
          </span>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}
