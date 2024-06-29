import AddFriend from '../components/AddFriend';
import Friends from '../components/Friends';
import User from '../components/User';

const Profile = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <User />
      <AddFriend />
      <Friends />
    </div>
  );
};

export default Profile;
