import React, { useEffect, useState } from 'react';
import { AppContext } from './AppContext';

const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');

    if (storedToken) setToken(storedToken);
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  return (
    <AppContext.Provider value={{ token, setToken, userData, setUserData }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
