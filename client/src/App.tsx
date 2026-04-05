import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('habboUser');
    setIsAuthenticated(!!user);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
      }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route component={() => {
        if (!isAuthenticated) {
          setLocation('/login');
        }
        return <Home />;
      }} />
    </Switch>
  );
}
