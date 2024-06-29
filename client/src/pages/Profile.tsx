import AddFriend from '../components/AddFriend';
import Friends from '../components/Friends';
import User from '../components/User';
import MatchHistory from '../components/MatchHistory';
// import User from '../components/User';

const Profile = () => {
  // You can add more profile-specific content or logic here
  return (
    <div>
      <h1>User Profile</h1>
      <User />
      <AddFriend />
      <Friends />
      <h2>Match history</h2>
      <MatchHistory filterUser={true} />
    </div>
  );
};

export default Profile;
