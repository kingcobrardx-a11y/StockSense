import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'usr_01',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@stocksense.io',
  role: 'Operations Lead',
  warehouse: 'Main Distribution Hub (WH-01)',
  avatar: 'SJ',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email, _password) => {
    // Hackathon demo authentication flow
    const username = email ? email.split('@')[0] : 'sarah';
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    
    setUser({
      id: 'usr_' + Date.now(),
      name: formattedName || 'Operations Admin',
      email: email || 'admin@stocksense.io',
      role: 'Warehouse Manager',
      warehouse: 'Main Distribution Hub',
      avatar: (formattedName ? formattedName.slice(0, 2) : 'OA').toUpperCase(),
    });
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
