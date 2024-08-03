import AddFriend from '../components/AddFriend';
import Friends from '../components/Friends';
import User from '../components/User';
import MatchHistory from '../components/MatchHistory';
import { Typography } from '@mui/material';
import Col from '../components/Col';
// import User from '../components/User';

const Profile = () => {
  return (
    <Col gap={'.5rem'} padding={'1rem'}>
      <Typography variant="h3">User Profile</Typography>
      <User />
      <AddFriend />
      <Friends />
      <MatchHistory filterUser={true} />
    </Col>
  );
};

export default Profile;
