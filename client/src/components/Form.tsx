// // import { TextField } from "@mui/material";

// // export default function Form() {
// //   return (
// //     <form className={classes.root}>
// //       <TextField label="First Name" variant="filled" required />
// //       <TextField label="Last Name" variant="filled" required />
// //       <TextField label="Email" variant="filled" type="email" required />
// //       <TextField label="Password" variant="filled" type="password" required />
// //     </form>
// //   );
// // }


// import React, { useState } from 'react';
// import { TextField, Button } from '@material-ui/core';

// const ProfileEdit = () => {
//   const [username, setUsername] = useState('');

//   const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setUsername(event.target.value);
//   };

//   const handleSubmit = async () => {
//     try {
//       // Remplacer 'url' par l'URL appropriée de votre API
//       const response = await fetch('url', { username }, {
//         headers: {
//           'Authorization': `Bearer ${votreTokenJWT}`
//         }
//       });
//       if (response.status === 200) {
//         // Gérer la mise à jour réussie
//         alert('Nom mis à jour avec succès');
//       }
//     } catch (error) {
//       // Gérer les erreurs
//       alert('Erreur lors de la mise à jour du nom');
//     }
//   };

//   return (
//     <div>
//       <TextField
//         label="Nom d'utilisateur"
//         value={username}
//         onChange={handleUsernameChange}
//       />
//       <Button onClick={handleSubmit}>Mettre à jour</Button>
//     </div>
//   );
// };

// export default ProfileEdit;
