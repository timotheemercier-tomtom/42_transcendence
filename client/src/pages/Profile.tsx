import Friends from '../components/Friends';
// import User from '../components/User/User';
// import UserProfile from '../components/User/UserProfile';
import User from '../components/User/User';

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
