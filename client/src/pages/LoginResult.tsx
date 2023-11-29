import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginResult() {
  const navigate = useNavigate();

  useEffect(() => {
    // Place the navigation logic inside useEffect
    // to ensure it runs after the component mounts
    navigate('/');
  }, [navigate]); // Add navigate to the dependency array

  // Return null or a loader as the user won't see this component
  // because of the immediate redirect
  return null;
}

export default LoginResult;
