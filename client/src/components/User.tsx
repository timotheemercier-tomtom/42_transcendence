import { Card, CircularProgress, Switch } from '@mui/material';
import { User as UserData } from 'common';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { API } from '../util';
import FormWithValidation from './Form';
import Picture from './Picture';
import Typography from './Typography';

type UserContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
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
): Promise<UserData> {
  const response = await fetch(API + `/user/${login}/image`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ picture: base64Image }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to update user image');
  }

  return response.json();
}

function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [userVerificationCode, setUserVerificationCode] = useState('');

  const { login = '' } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(API + `/user/${login}/`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Network response error');
        const data = (await response.json()) as UserData;
        setUserData(data);
        setIsTwoFAEnabled(!!data.twoFA);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!userData) return null;

  const updateUserData = (newPicture: string) => {
    if (userData) {
      setUserData({ ...userData, picture: newPicture });
    }
  };

  const handleToggle2FA = async (verificationCode: any) => {
    setLoading(true);
    try {
      if (isTwoFAEnabled) {
        // Call API to disable 2FA
        await fetch(API + `/2fa/disable`, {
          method: 'POST',
          credentials: 'include',
        });
        setIsTwoFAEnabled(false);
        setQrCodeUrl(null); // Clear QR code URL if 2FA is disabled
      } else {
        // Call API to generate 2FA secret and QR code
        const response = await fetch(API + `/2fa/generate`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const { qrCode } = await response.json();
          setQrCodeUrl(qrCode);
          // Now, prompt the user to enter the 2FA code from their authentication app
          // This might involve setting a state to show an input field and a submit button for the verification code
          // Assuming verificationCode is passed to this function when the user submits their 2FA code
          if (verificationCode) {
            const enableResponse = await fetch(API + `/2fa/enable`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ twoFACode: verificationCode }),
              credentials: 'include',
            });
            if (enableResponse.ok) {
              setIsTwoFAEnabled(true);
            } else {
              throw new Error('Failed to enable 2FA with provided code.');
            }
          }
        } else {
          throw new Error('Failed to generate 2FA setup details.');
        }
      }
    } catch (error) {
      console.error('2FA toggle failed:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerificationCode = async () => {
    setLoading(true);
    try {
      const enableResponse = await fetch(API + `/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ twoFACode: userVerificationCode }),
        credentials: 'include',
      });
      if (enableResponse.ok) {
        setIsTwoFAEnabled(true);
        setShowVerificationInput(false); // Hide verification code input after successful submission
        setQrCodeUrl(null); // Optionally clear QR code
      } else {
        throw new Error('Failed to enable 2FA with provided code.');
      }
    } catch (error) {
      console.error('Verification code submission failed:', error);
      // Optionally handle the error, such as displaying a message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Picture
        username={userData.username}
        picture={userData.picture}
        onUpdate={async (newPictureUrl: string) => {
          try {
            const updatedUser = await updateUserImage(
              userData.login,
              newPictureUrl,
            );
            setUserData(updatedUser);
          } catch (error) {
            console.error('Error updating user image:', error);
          }
        }}
      />
      <Typography variant="h5">Account Details</Typography>
      <Typography variant="h5">Intra Login: {userData.username}</Typography>
      <Link to={'/u/asaijers'}>Alfa Profile</Link>
      <br />
      <Link to={'/u/tmercier'}>Tim Profile</Link>
      <Switch
        checked={isTwoFAEnabled}
        onChange={handleToggle2FA}
        name="toggle2FA"
        inputProps={{ 'aria-label': 'secondary checkbox' }}
      />
      <Typography>Enable 2FA</Typography>
      {qrCodeUrl && (
        <div>
          <img src={qrCodeUrl} alt="QR Code" />
          {showVerificationInput && (
            <div>
              <input
                type="text"
                value={userVerificationCode}
                onChange={(e) => setUserVerificationCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <button onClick={handleSubmitVerificationCode}>Verify</button>
            </div>
          )}
        </div>
      )}
      <FormWithValidation
        initialFormData={userData}
        onImageUpdate={updateUserData}
      />
    </Card>
  );
}
export default User;

//   const handleVerify2FACode = async () => {
//     try {
//       const response = await fetch(`http://localhost:3000/2fa/verify`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ twoFACode }),
//         credentials: 'include',
//       });

//       if (!response.ok) throw new Error('Failed to verify 2FA code');
//       // Handle successful verification
//       setOtpAuthUrl(null); // Clear QR code
//     } catch (error) {
//       console.error('Error verifying 2FA code:', error);
//     }
//   };
