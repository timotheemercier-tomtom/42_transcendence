import { StatusData } from 'common';
import { useEffect, useState } from 'react';
import { socket } from '../status.socket';
import Row from './Row';

const Status = () => {
  const [status, setStatus] = useState<StatusData>([]);
  let user = sessionStorage.getItem('user') ?? '';
  if (user.startsWith('$')) user = '$anon' + user;

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('list', setStatus);
    return () => {
      socket.off('list', setStatus);
    };
  }, []);

  return (
    <Row>
      {status.map((v, i) => (
        <span key={i}>
          {v[0]}: {v[1]}
        </span>
      ))}
    </Row>
  );
};

export default Status;
