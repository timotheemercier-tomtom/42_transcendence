import { Avatar } from '@mui/material';
import { User } from 'common';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API } from '../util';
import Col from './Col';
import Row from './Row';

const Friends = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const { login } = useParams();

  useEffect(() => {
    const f = async () => {
      const res = await fetch(API + `/user/${login}/friends`, {
        credentials: 'include',
      });
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
          <Link key={i} to={'/u/' + v.login}>
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
