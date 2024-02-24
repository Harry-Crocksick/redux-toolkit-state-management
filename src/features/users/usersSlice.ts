import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "../../app/store";
import axios from "axios";

const USERS_URL = "https://jsonplaceholder.typicode.com/users" as const;

interface UserProps {
  id: string;
  name: string;
}

const initialState: Array<UserProps> = [];

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const response = await axios.get(USERS_URL);
    return response.data;
  } catch (err) {
    if (err instanceof Error) return err.message;
  }
});

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (_state, action) => {
      return action.payload;
    });
  },
});

export const selectAllUsers = (state: AppState) => state.users;

export default usersSlice.reducer;
