import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { ChatLayout } from './components/Layout/ChatLayout';
import { Login } from './components/Auth/Login';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { ConfigProvider, theme } from 'antd';
import { useState } from 'react';
import { ThemeContext } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1668dc',
          colorBgContainer: darkMode ? '#141414' : '#ffffff',
          colorBgElevated: darkMode ? '#1f1f1f' : '#ffffff',
        },
      }}
    >
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
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
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export default App;