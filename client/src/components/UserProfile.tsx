import React, { useEffect, useState } from 'react';
import { Typography, Avatar } from '@material-ui/core';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    picture: '',
  });

  useEffect(() => {
    const apiUrl = 'http://localhost:3000/user';

    fetch(apiUrl, {
      method: 'GET',
      credentials: 'include', // Important: This includes cookies in the request
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData({
          username: data.username,
          email: data.emails[0].value,
          picture: data.image.link,
        });
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  return (
    <div>
      <Typography variant="h4">User Profile</Typography>
      <Typography variant="h6">Username: {userData.username}</Typography>
      <Typography variant="h6">Email: {userData.email}</Typography>
      <div>
        <Typography variant="h6">Profile Picture:</Typography>
        <Avatar src={userData.picture} alt="Profile Picture" />
      </div>
    </div>
  );
};

export default UserProfile;
