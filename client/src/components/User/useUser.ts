// import { useState, useContext, createContext, useCallback } from 'react';
// import { User } from 'common';
// import { updateUserImage } from './userService';

// type UserContextType = {
//   user: User | null;
//   setUser: React.Dispatch<React.SetStateAction<User | null>>;
// };



// const UserContext = createContext<UserContextType | null>(null);
  

// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const userState = useUserState();
//     // return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
//     return (
//         <UserContext.Provider value={userState}>
//           {children}
//         </UserContext.Provider>
//       );
//   };
  
// const useUserState = () => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
//     const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
//     const [twoFACode, setTwoFACode] = useState('');
//     const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
//     return { user, setUser, isTwoFAEnabled, setIsTwoFAEnabled, otpAuthUrl, setOtpAuthUrl, twoFACode, setTwoFACode, qrCodeUrl, setQrCodeUrl };
//   };

//   export const useUser = () => useContext(UserContext);


// const useUserUpdate = () => {
//     const [user, setUser] = useState<User | null>(null);
  
//     const updateUser = useCallback((newData: Partial<User>) => {
//       setUser((prevUser: any) => ({ ...prevUser, ...newData }));
//     }, []);
  
//     const updateUserPicture = async (login: string, newPicture: string) => {
//       try {
//         const updatedUser = await updateUserImage(login, newPicture);
//         updateUser({ picture: updatedUser.picture });
//       } catch (error) {
//         console.error('Erreur lors de la mise à jour de l’image de l’utilisateur', error);
//       }
//     };
//     return { user, updateUserData: updateUser, updateUserPicture };
// };

// export default useUserUpdate;