// 使用 Redux Toolkit 进行状态管理
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import modelsReducer from './slices/modelsSlice';
import conversationsReducer from './slices/conversationsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    models: modelsReducer,
    conversations: conversationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 