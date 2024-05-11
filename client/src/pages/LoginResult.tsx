import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LoginResult() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  useEffect(() => {
    // Place the navigation logic inside useEffect
    // to ensure it runs after the component mounts
    // sessionStorage.setItem('user', query.get('u') ?? '');
    document.cookie = 'accessToken=' + query.get('token');
    navigate('/');
  }, [navigate, query]); // Add navigate to the dependency array

  // Return null or a loader as the user won't see this component
  // because of the immediate redirect
  return null;
}

export default LoginResult;
