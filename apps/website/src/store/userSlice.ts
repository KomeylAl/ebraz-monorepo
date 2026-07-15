// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  phone: string;
  role: string;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: "",
  phone: "",
  role: "",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.name = "";
      state.phone = "";
      state.role = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
