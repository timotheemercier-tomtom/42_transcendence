// import { useState } from 'react';
// import { API } from '../../util';

// export const useTwoFA = () => {
//   const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
//   const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
//   const [twoFACode, setTwoFACode] = useState<string>('');

//   const handleEnable2FA = async () => {
//     try {
//       const response = await fetch(API + '/2fa/enable', {
//         method: 'POST',
//         credentials: 'include',
//       });
//       const data = await response.json();
//       if (data.otpAuthUrl) {
//         setOtpAuthUrl(data.otpAuthUrl);
//       }
//     } catch (error) {
//       console.error('Erreur lors de l’activation de la 2FA:', error);
//     }
//   };

//   const handleVerify2FACode = async (
//     twoFACode: React.Dispatch<React.SetStateAction<string | null>>,
//     setOtpAuthUrl: React.Dispatch<React.SetStateAction<string | null>>,
//   ) => {
//     try {
//       const response = await fetch(API + `2fa/verify`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ twoFACode }),
//         credentials: 'include',
//       });

//       if (!response.ok) throw new Error('Failed to verify 2FA code');
//       setOtpAuthUrl(null);
//     } catch (error) {
//       console.error('Error verifying 2FA code:', error);
//     }
//   };

//   return {
//     isTwoFAEnabled,
//     setIsTwoFAEnabled,
//     otpAuthUrl,
//     setOtpAuthUrl,
//     twoFACode,
//     setTwoFACode,
//     handleEnable2FA,
//     handleVerify2FACode,
//   };
// };
