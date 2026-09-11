import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import { refreshRoute } from "../utils/APIRoutes";
import apiClient from "../utils/apiClient";
import { getSocket } from "../utils/socket";

const legacyKey = process.env.REACT_APP_LOCALHOST_KEY || "";
const initialUserRaw = legacyKey
  ? localStorage.getItem(legacyKey) || localStorage.getItem("user")
  : localStorage.getItem("user");

const initialState = {
  user: initialUserRaw ? JSON.parse(initialUserRaw) : null,
  token: localStorage.getItem("token") || null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
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
    case "REFRESH_TOKEN":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.token) {
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${state.token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }

    setIsLoading(false);
  }, [state.token]);

  const prevUserRef = useRef(state?.user?._id || null);
  useEffect(() => {
    console.log("AuthContext: user changed:", state?.user?._id);
    const socket = getSocket();
    const currentUserId = state?.user?._id;
    const prevUserId = prevUserRef.current;

    const ensureJoin = () => {
      if (currentUserId) socket.emit("join", currentUserId);
    };

    ensureJoin();
    socket.on("connect", ensureJoin);

    if (!currentUserId && prevUserId) {
      socket.emit("leave", prevUserId);
    }

    prevUserRef.current = currentUserId || null;

    return () => {
      socket.off("connect", ensureJoin);
    };
  }, [state?.user]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await apiClient.post(refreshRoute);
      if (!data?.accessToken) {
        throw new Error("Refresh endpoint did not return an access token");
      }

      dispatch({
        type: "REFRESH_TOKEN",
        payload: {
          token: data.accessToken,
        },
      });

      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;
      return data;
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, refreshSession, isLoading }),
    [state, refreshSession, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
