import { useEffect, useState } from 'react';
import { socket } from '../status.socket';
import Row from './Row';
import { StatusType, StatusList, StatusState } from '../../../common';

import { Link } from 'react-router-dom';
import { getLogin } from '../util';

const Status = () => {
  const [status, setStatus] = useState(new Map<string, StatusType>());
  const user = getLogin();
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onlist = (e: StatusList) => {
      setStatus(new Map(e));
    };
    const onstate = (e: StatusState) => {
      setStatus((v) => new Map(v).set(e[0], e[1]));
    };
    socket.on('list', onlist);
    socket.on('state', onstate);
    return () => {
      socket.off('list', onlist);
      socket.off('state', onstate);
    };
  }, []);

  return (
    <Row gap={'.5rem'}>
      <span>you: {user}</span>
      {Array.from(status.entries()).map((v, i) => (
        <span key={i}>
          <Link to={'/u/' + v[0]}>{v[0]}</Link> : {v[1]}
        </span>
      ))}
    </Row>
  );
};

export default Status;
