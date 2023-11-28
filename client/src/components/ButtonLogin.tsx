import Button from '@mui/material/Button';

export default function ButtonLogin() {
//   const handleLogin = () => {
//     // Redirects to the NestJS backend login route
//     window.location.href = '';
//   };

//   return (
//     <Button variant="contained" onClick={handleLogin}>
//       Log In
//     </Button>
//   );
  return (
    <a href="http://localhost:3000/auth/42">
      <Button variant="contained">
        Log In
      </Button>
    </a>
  );
}
