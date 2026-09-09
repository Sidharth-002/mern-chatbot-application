import { configureStore } from "@reduxjs/toolkit";
import messagesReducer from "./messageSlice";

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
  },
});

export default store;
