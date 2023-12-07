import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';

interface LoginProps {
  open: boolean;
  handleClose: () => void;
}

import ButtonLogin from './ButtonLogin';

const LoginModule: React.FC<LoginProps> = ({ open, handleClose }) => {
  const [loggedInWith42, setLoggedInWith42] = useState(false);

  const clientId = process.env.AUTH_ID;
  const redirectUri = process.env.REDIRECT_URI;
  if (!clientId || !redirectUri) {
    console.error('Error: Missing AUTH_ID or URI');
    return null;
  }
  //   const authUrl =
  // `https://api.intra.42.fr/oauth/authorize?response_type=code&` +
  // `client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  const authUrl =
    'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f9c49a4ef300b737' +
    'c3a3044787c5859e8009f6c708380db159b31f81b684b003&redirect_uri=http%3A%2F%2F' +
    'localhost%3A3000%2Fauth%2F42%2Fcallback&response_type=code';

  const handle42Login = () => {
    window.location.href = authUrl;
  };
  return (
      <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Choose an Option</DialogTitle>
      <DialogContent>
        {loggedInWith42 ? (
          <p>You are logged in with Intra 42.</p>
        ) : (
          <>
            <ButtonLogin onClick={handle42Login} text="Log In with 42" />
            <Button variant="contained" color="primary">
              Login
            </Button>
            <Button variant="contained" color="primary">
              Sign Up
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default LoginModule;

//   const handleLoginWith42 = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/auth/42');
//       if (response.ok) {
//         setLoggedInWith42(true);
//         console.log('Connected to Intra 42');
//         // navigate('./Room');
//       } else {
//         // Gérer les erreurs
//         console.error('Échec de la connexion avec Intra 42');
//       }
//     } catch (error) {
//       console.error('Erreur lors de la connexion', error);
//     }
//   };

// const LoginDialog: React.FC<LoginDialogProps> = ({ open, handleClose }) => {
//   // État pour suivre si l'utilisateur est déjà connecté avec 42
//   const [loggedInWith42, setLoggedInWith42] = useState(false);

//   // Fonction pour gérer la connexion avec 42
//   const handleLoginWith42 = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/auth/42');
//       if (response.ok) {
//         setLoggedInWith42(true);
//         console.log('Connected to Intra 42');

//         // navigate('./Room');
//       } else {
//         // Gérer les erreurs
//         console.error('Échec de la connexion avec Intra 42');
//       }
//     } catch (error) {
//       console.error('Erreur lors de la connexion', error);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose}>
//       <DialogTitle>Choose an Option</DialogTitle>
//       <DialogContent>
//         {loggedInWith42 ? (
//           // Si l'utilisateur est connecté avec 42, affichez un message ou un bouton de déconnexion
//           <p>You are logged in with Intra 42.</p>
//         ) : (
//           // Si l'utilisateur n'est pas connecté avec 42, affichez les options de connexion
//           <>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() =>
//                 (window.location.href =
//                   'https://api.intra.42.fr/oauth/authorize?response_type=code&redirect_uri=...&client_id=...')
//               }
//             >
//               Log In with 42
//             </Button>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleLoginWith42}
//             >
//               Login with Intra 42
//             </Button>
//             <Button variant="contained" color="primary">
//               Login
//             </Button>
//             <Button variant="contained" color="primary">
//               Sign Up
//             </Button>
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose} color="primary">
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default LoginDialog;
