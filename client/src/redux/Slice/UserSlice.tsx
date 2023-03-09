import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "LoganZ",
  email: "ln26805@gmail.com",
  password: "alooo",
  userImage: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
  userRole: 1,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state = action.payload;
    },
  },
});

export const { loginUser } = userSlice.actions;
export default userSlice.reducer;
