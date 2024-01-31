import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Avatar,
  Button,
  Card,
  CircularProgress,
  Switch,
  TextField,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import Typography from '../Typography';
import Picture from '../Picture';
import FormWithValidation from '../Form';
import { API } from '../../util';
import { User } from 'common';

type UserContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserContextType['user']>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export async function updateUserImage(
  login: string,
  base64Image: string,
): Promise<User> {
  const response = await fetch(
    `http://${location.hostname}:3000/user/${login}/image`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ picture: base64Image }),
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to update user image');
  }

  return response.json();
}

function getUserInfos() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const [otpAuthUrl, setOtpAuthUrl] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const { login = '' } = useParams();

  useEffect(() => {
    fetchUserData();
  });

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://${location.hostname}:3000/user/` + login,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      if (!response.ok) throw new Error('Network response error');
      const data = (await response.json()) as User;
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!user) return null;

  const updateUser = (newPicture: string) => {
    if (user) {
      setUser({ ...user, picture: newPicture });
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await fetch(API + '/2fa/enable', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.otpAuthUrl) {
        // Mettre à jour l'état avec l'URL du QR code
        setQrCodeUrl(data.otpAuthUrl);
      }
    } catch (error) {
      console.error('Erreur lors de l’activation de la 2FA:', error);
    }
  };

  const handleVerify2FACode = async () => {
    try {
      const response = await fetch(`http://localhost:3000/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ twoFACode }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to verify 2FA code');
      // Handle successful verification
      setOtpAuthUrl(null); // Clear QR code
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
    }
  };

  return (
    <Card>
      <Picture
        username={user.username}
        picture={user.picture}
        onUpdate={async (newPictureUrl: string) => {
          try {
            const updatedUser = await updateUserImage(
              user.login,
              newPictureUrl,
            );
            setUser(updatedUser);
          } catch (error) {
            console.error('Error updating user image:', error);
          }
        }}
      />
      <Typography variant="h5">Account Details</Typography>
      <Typography variant="h5">Intra Login: {user.username}</Typography>
      <Link to={'/u/asaijers'}>Alfa Profile</Link>
      <br />
      <Link to={'/u/tmercier'}>Tim Profile</Link>

      <FormWithValidation initialFormData={user} onImageUpdate={updateUser} />
      <Switch
        checked={isTwoFAEnabled}
        onChange={handleEnable2FA}
        name="twoFASwitch"
        inputProps={{ 'aria-label': 'secondary checkbox' }}
      />
      {otpAuthUrl && (
        <>
          <img src={otpAuthUrl} alt="QR Code" />
          <TextField
            label="2FA Code"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value)}
          />
          <Button onClick={handleVerify2FACode}>Verify</Button>
        </>
      )}
    </Card>
  );
}
export default getUserInfos;

//   const handleToggle2FA = async () => {
//     const newTwoFAState = !isTwoFAEnabled;
//     setIsTwoFAEnabled(newTwoFAState);

//     if (newTwoFAState) {
//       try {
//         const response = await fetch(`http://localhost:3000/2fa/generate`, {
//           method: 'POST',
//           credentials: 'include',
//         });
//         if (!response.ok) throw new Error('Failed to generate 2FA secret');
//         const data = await response.json();
//         setOtpAuthUrl(data.otpAuthUrl);
//       } catch (error) {
//         console.error('Error generating 2FA secret:', error);
//       }
//     } else {
//       // Disable 2FA
//       try {
//         await fetch(`http://localhost:3000/2fa/disable`, {
//           method: 'POST',
//           credentials: 'include',
//         });
//         // Assuming disabling 2FA doesn't require additional verification
//       } catch (error) {
//         console.error('Error disabling 2FA:', error);
//       }
//     }
//   };
