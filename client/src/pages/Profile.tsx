import AddFriend from '../components/AddFriend';
import Friends from '../components/Friends';
import Login from '../components/Login';
import User from '../components/User';
// import User from '../components/User';

const Profile = () => {
  // You can add more profile-specific content or logic here
  return (
    <div>
      <h1>User Profile</h1>
      <User />
      <Login text="Log In" />
      <AddFriend />
      <Friends />
      {/* Other profile-related components */}
    </div>
  );
};

export default Profile;
