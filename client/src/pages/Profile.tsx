import React from 'react';
import Friends from '../components/Friends';
import User from '../components/User';

const Profile = () => {
  // You can add more profile-specific content or logic here
  return (
    <div>
      <h1>User Profile</h1>
      <User />
      {/* <UserProfile /> */}
      <Friends />
      {/* Other profile-related components */}
    </div>
  );
};

export default Profile;
