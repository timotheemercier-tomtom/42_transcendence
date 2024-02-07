// import React, { useState } from 'react';
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
// } from '@material-ui/core';

// interface LoginProps {
//   open: boolean;
//   handleClose: () => void;
// }

// import ButtonLogin from './ButtonLogin';

// const LoginModule: React.FC<LoginProps> = ({ open, handleClose }) => {
//   const [loggedInWith42, setLoggedInWith42] = useState(false);

//   const handle42Login = () => {
//     window.location.href = 'http://localhost:3000/auth/42';
//   };
//   return <ButtonLogin onClick={handle42Login} text="Log In" />;
// };
// export default LoginModule;

// //   const handleLoginWith42 = async () => {
// //     try {
// //       const response = await fetch('http://localhost:3000/auth/42');
// //       if (response.ok) {
// //         setLoggedInWith42(true);
// //         console.log('Connected to Intra 42');
// //         // navigate('./Room');
// //       } else {
// //         // Gérer les erreurs
// //         console.error('Échec de la connexion avec Intra 42');
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors de la connexion', error);
// //     }
// //   };

// // const LoginDialog: React.FC<LoginDialogProps> = ({ open, handleClose }) => {
// //   // État pour suivre si l'utilisateur est déjà connecté avec 42
// //   const [loggedInWith42, setLoggedInWith42] = useState(false);

// //   // Fonction pour gérer la connexion avec 42
// //   const handleLoginWith42 = async () => {
// //     try {
// //       const response = await fetch('http://localhost:3000/auth/42');
// //       if (response.ok) {
// //         setLoggedInWith42(true);
// //         console.log('Connected to Intra 42');

// //         // navigate('./Room');
// //       } else {
// //         // Gérer les erreurs
// //         console.error('Échec de la connexion avec Intra 42');
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors de la connexion', error);
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onClose={handleClose}>
// //       <DialogTitle>Choose an Option</DialogTitle>
// //       <DialogContent>
// //         {loggedInWith42 ? (
// //           // Si l'utilisateur est connecté avec 42, affichez un message ou un bouton de déconnexion
// //           <p>You are logged in with Intra 42.</p>
// //         ) : (
// //           // Si l'utilisateur n'est pas connecté avec 42, affichez les options de connexion
// //           <>
// //             <Button
// //               variant="contained"
// //               color="primary"
// //               onClick={() =>
// //                 (window.location.href =
// //                   'https://api.intra.42.fr/oauth/authorize?response_type=code&redirect_uri=...&client_id=...')
// //               }
// //             >
// //               Log In with 42
// //             </Button>
// //             <Button
// //               variant="contained"
// //               color="primary"
// //               onClick={handleLoginWith42}
// //             >
// //               Login with Intra 42
// //             </Button>
// //             <Button variant="contained" color="primary">
// //               Login
// //             </Button>
// //             <Button variant="contained" color="primary">
// //               Sign Up
// //             </Button>
// //           </>
// //         )}
// //       </DialogContent>
// //       <DialogActions>
// //         <Button onClick={handleClose} color="primary">
// //           Close
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // export default LoginDialog;
