import { useEffect, useState } from 'react';
import Col from './Col';
import { User } from 'common';
import { Avatar } from '@mui/material';
import Row from './Row';
import { Link, useParams } from 'react-router-dom';

const Friends = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const { login } = useParams();

  useEffect(() => {
    const f = async () => {
      const res = await fetch(`http://localhost:3000/user/${login}/friends`);
      const data = await res.json();
      setFriends(data);
    };
    console.log('....');

    f();
  }, [login]);
  return (
    <Col>
      <h3>Friends:</h3>
      <Col overflow={'scroll'}>
        {friends.map((v, i) => (
          <Link to={'/u/' + v.login}>
            <Row alignItems={'center'} gap={'.5rem'}>
              <Avatar src={v.picture}></Avatar>
              <span key={i}>{v.login}</span>
            </Row>
          </Link>
        ))}
      </Col>
    </Col>
  );
};

export default Friends;
