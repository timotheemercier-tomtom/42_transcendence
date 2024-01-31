// import { User } from 'common';

// export const getUser = async (login: string): Promise<User> => {
//   try {
//     const response = await fetch(
//       `http://${location.hostname}:3000/user/${login}`,
//       {
//         method: 'GET',
//         credentials: 'include',
//       },
//     );
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return (await response.json()) as User;
//   } catch (error) {
//     throw new Error('Failed to fetch user data');
//   }
// };

// export const updateUserImage = async (
//   login: string,
//   base64Image: string,
// ): Promise<User> => {
//   try {
//     const response = await fetch(
//       `http://${location.hostname}:3000/user/${login}/image`,
//       {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ picture: base64Image }),
//         credentials: 'include',
//       },
//     );
//     if (!response.ok) {
//       throw new Error('Failed to update user image');
//     }
//     return (await response.json()) as User;
//   } catch (error) {
//     throw new Error('Failed to update user image');
//   }
// };
