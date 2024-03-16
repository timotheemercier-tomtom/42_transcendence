import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LoginResult() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  useEffect(() => {
    sessionStorage.setItem('user', query.get('u') ?? '');
    document.cookie = 'accessToken=' + query.get('token');
    navigate('/');
  }, [navigate, query]); 

  return null;
}

export default LoginResult;
