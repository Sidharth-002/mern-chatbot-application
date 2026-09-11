import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logoutRoute } from "../utils/APIRoutes";
import apiClient from "../utils/apiClient";
import { AuthContext } from "../context/AuthContext";
import { toastOptions } from "../utils/toast";

export default function Logout() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AuthContext);

  const handleClick = async () => {
    try {
      const id = state?.user?._id;
      const { data } = await apiClient.get(`${logoutRoute}/${id}`);
      if (data?.status === false) {
        toast.error(data.msg || "Logout failed", toastOptions);
        return;
      }
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.msg || error.message || "Logout failed";
      toast.error(msg, toastOptions);
    }
  };
  return (
    <>
      <Button onClick={handleClick}>
        <BiPowerOff />
      </Button>
      <ToastContainer />{" "}
    </>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }

  @media screen and (max-width: 720px) {
    display: none;
  }
`;
