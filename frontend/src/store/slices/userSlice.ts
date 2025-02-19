import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface UserState {
  currentUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.status = 'succeeded';
    },
    logout: (state) => {
      state.currentUser = null;
      state.status = 'idle';
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer; 