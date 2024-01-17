import { useUser } from '../components/User';
// const { username } = useParams<{ username: string }>();

export const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user.name}</p>
      <p>Username: {user.username}</p>
      <img src={user.picture} alt="User" />
    </div>
  );
};
