// 使用 Redux Toolkit 进行状态管理
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import conversationsReducer from './slices/conversationsSlice';
import modelsReducer from './slices/modelsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationsReducer,
    models: modelsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 