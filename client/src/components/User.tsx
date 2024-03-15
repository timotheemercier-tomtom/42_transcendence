import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Button, Card, TextField } from '@material-ui/core';
import axios from 'axios';
import { User as UserData } from 'common';
import EnableTwoFA from './EnableTwoFA';
import Typography from './Typography';
import { API } from '../util';

interface UserContextValue {
  userData: UserData | null;
  setUserData: Dispatch<SetStateAction<UserData | null>>;
}

const UserContext = React.createContext<UserContextValue>({
  userData: null,
  setUserData: () => {},
});


const UserComponent: React.FC = () => UserData: any {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState<boolean>(false);
  const [userVerificationCode, setUserVerificationCode] = useState<string>('');

  const userContext = React.useContext(UserContext);
  const userDataContext = userContext.userData;
  const setUserDataContext = userContext.setUserData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<UserData>('/user', {
          withCredentials: true,
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

  const handle2FAEnable = async () => {
    try {
      const response = await axios.post('/2fa/enable', {}, {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error('Failed to enable 2FA');
      }

      setIsTwoFAEnabled(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  interface FormWithValidationProps {
    initialFormData: Partial<UserData>;
    onImageUpdate: (data: FormData) => void;
    onUsernameUpdate: (username: string) => void;
    hasTwoFA: boolean;
  }

  const FormWithValidation: React.FC<FormWithValidationProps> = ({
    initialFormData,
    onImageUpdate,
    onUsernameUpdate,
    hasTwoFA,
  }) => {
    const [userImage, setUserImage] = React.useState<File | null>(null);
    const [username, setUsername] = React.useState<string | undefined>(initialFormData.username);

    const handleUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (
      e,
    ) => {
      setUsername(e.target.value);
    };

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (
      e,
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setUserImage(file);
      }
    };

    const handle2FAVerification = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const response = await axios.post<void>(
          `/2fa/verify`,
          { twoFACode: userVerificationCode },
          { withCredentials: true },
        );

        if (response.status !== 200)
          throw new Error('Failed to verify 2FA code');

        setQrCodeUrl(null);
        handle2FAEnable();

      } catch (error) {
        console.error('Error verifying 2FA code:', error);
      }
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
      e.preventDefault();

      if (userImage) {
        const formData = new FormData();
        formData.append('username', username ?? '');
        formData.append('picture', userImage);

        axios.patch(API + `/user/${userData?.login}/image`, formData, {
          withCredentials: true,
        });

        setUserImage(null);
      }

      axios.patch(
        API + `/user/${userData?.login}/image`,
        { username: username },
        { withCredentials: true },
      );
    };



    if (userData === null) {
      return <div>Loading...</div>;
    }

    return (
      <UserContext.Provider value={{ userData, setUserData }}>
        <Card>
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <TextField
              label="Username"
              value={username}
              onChange={handleUsernameChange}
              margin="normal"
            />

            {/* User Image */}
            <input type="file" onChange={handleImageChange} />

            <Button type="submit" variant="contained">
              Update
            </Button>
          </form>
          <form onSubmit={handle2FAVerification}>
            <input
              type="text"
              value={userVerificationCode}
              onChange={(event) => setUserVerificationCode(event.target.value)}
            />
            <button type="submit">Verify 2FA Code</button>
          </form>
          <Typography variant="h5">Account Details</Typography>
          <Typography variant="h5">Intra Login: {userData.login}</Typography>
          <FormWithValidation
            initialFormData={{
              username: initialFormData.username,
              picture: initialFormData.picture,
            }}
            onImageUpdate={onImageUpdate}
            onUsernameUpdate={onUsernameUpdate}
            hasTwoFA={!isTwoFAEnabled}
          />

          {!isTwoFAEnabled ? (
            <>
              <Typography variant="h5">Enable 2FA</Typography>
              <EnableTwoFA onVerify={setQrCodeUrl} />
            </>
          ) : (
            <Typography variant="h6">
              2FA is enabled for your account.
            </Typography>
          )}
        </Card>
      </UserContext.Provider>
    );
  };
};
