import React, { createContext, useReducer, useMemo, useEffect } from "react";
import axios from "axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      // also preserve legacy storage key used elsewhere in the app
      try {
        const legacyKey = process.env.REACT_APP_LOCALHOST_KEY;
        if (legacyKey) {
          localStorage.setItem(legacyKey, JSON.stringify(action.payload.user));
        }
      } catch (e) {}
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      try {
        const legacyKey = process.env.REACT_APP_LOCALHOST_KEY;
        if (legacyKey) localStorage.removeItem(legacyKey);
      } catch (e) {}
      return { ...state, user: null, token: null };
    default:
      return state;
  }
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
