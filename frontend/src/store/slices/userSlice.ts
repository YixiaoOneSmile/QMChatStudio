import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

interface User {
  id: number;
  username: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface UserState {
  currentUser: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const loginAsync = createAsyncThunk<
  LoginResponse,
  { username: string; password: string }
>('user/login', async (credentials) => {
  const response = await authAPI.login(credentials.username, credentials.password);
  localStorage.setItem('token', response.token);
  return response;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '登录失败';
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer; 