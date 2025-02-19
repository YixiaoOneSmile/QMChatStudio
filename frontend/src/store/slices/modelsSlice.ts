import { createSlice } from '@reduxjs/toolkit';
import type { Model } from '../../types';

const modelsSlice = createSlice({
  name: 'models',
  initialState: {
    models: [] as Model[],
    currentModel: null as Model | null,
  },
  reducers: {
    setCurrentModel: (state, action) => {
      state.currentModel = action.payload;
    },
  },
});

export const { setCurrentModel } = modelsSlice.actions;
export default modelsSlice.reducer; 