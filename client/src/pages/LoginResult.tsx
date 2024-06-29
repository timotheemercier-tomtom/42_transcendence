// LoginResult.tsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function LoginResult() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = query.get('token');
    if (token) {
      document.cookie = 'accessToken=' + token;
      
      // Fetch user info and update context
      const fetchUser = async () => {
        try {
          const response = await fetch(`http://${location.hostname}:3000/auth/check`, {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      
      fetchUser().then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [navigate, query, setUser]);

  return null;
}

export default LoginResult;
