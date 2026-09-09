import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    items: [],
  },
  reducers: {
    addMessage(state, action) {
      state.items.push(action.payload);
    },
    clearMessages(state) {
      state.items = [];
    },
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
