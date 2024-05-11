import AddFriend from '../components/AddFriend';
import Friends from '../components/Friends';
import User from '../components/User.tsx';

export const Profile = () => {
  // You can add more profile-specific content or logic here
  return (
    <div>
      <h1>User Profile</h1>
      <User />
      <AddFriend />
      <Friends />
      {/* Other profile-related components */}
    </div>
  );
};

