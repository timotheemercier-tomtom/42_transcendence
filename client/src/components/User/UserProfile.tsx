// import React, { useState, useEffect } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { CircularProgress, Card, Switch } from '@mui/material';
// import Typography from '../Typography';
// import Picture from '../Picture';
// import FormWithValidation from '../Form';
// import { getUser, updateUserImage } from './userService';
// import { User } from 'common';
// import { useTwoFA } from './useTwoFA';


// const UserProfile: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const { login } = useParams<{ login: string }>();
//   const {
//     isTwoFAEnabled,
//     setIsTwoFAEnabled,
//     otpAuthUrl,
//     setOtpAuthUrl,
//     twoFACode,
//     setTwoFACode,
//     handleEnable2FA,
//     handleVerify2FACode,
//   } = useTwoFA();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (login) {
//           const user = await getUser(login);
//           setUser(user);
//         }
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <CircularProgress />;
//   if (error) return <Typography color="error">{error}</Typography>;
//   if (!user) return null;

//   const updateUser = (newPicture: string) => {
//     if (user) {
//       setUser({ ...user, picture: newPicture });
//     }
//   };

//   return (
//     <Card>
//       <Picture
//         username={user.username}
//         picture={user.picture}
//         onUpdate={async (newPictureUrl: string) => {
//           try {
//             const updatedUser = await updateUserImage(
//               user.login,
//               newPictureUrl,
//             );
//             setUser(updatedUser);
//           } catch (error) {
//             console.error('Error updating user image:', error);
//           }
//         }}
//       />
//       <Typography variant="h5">Account Details</Typography>
//       <Typography variant="h5">Intra Login: {user.username}</Typography>
//       <p />
//       <Typography variant="h5">Test</Typography>
//       <br />
//       <Link to={'/u/asaijers'}>Alfa Profile</Link>
//       <br />
//       <Link to={'/u/tmercier'}>Tim Profile</Link>
//       <FormWithValidation initialFormData={user} onImageUpdate={updateUser} />
//       <Switch
//         checked={isTwoFAEnabled}
//         onChange={handleEnable2FA}
//         name="twoFASwitch"
//         inputProps={{ 'aria-label': 'secondary checkbox' }}
//       />
//     </Card>
//   );
// };
// export default UserProfile;
