import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { ChatLayout } from './components/Layout/ChatLayout';
import { Login } from './components/Auth/Login';
import { PrivateRoute } from './components/Auth/PrivateRoute';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ChatLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;