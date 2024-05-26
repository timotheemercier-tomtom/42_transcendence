import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LoginResult() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  useEffect(() => {

    document.cookie = 'accessToken=' + query.get('token');
    navigate('/');
  }, [navigate, query]); 

  // Return null or a loader as the user won't see this component
  // because of the immediate redirect
  return null;
}

export default LoginResult;
