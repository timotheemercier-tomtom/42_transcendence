import { Button } from '@mui/material';
import { API, getLogin } from '../util';
import { useParams } from 'react-router-dom';
import Row from './Row';
import { useState } from 'react';

const AddFriend = () => {
  const user = getLogin();
  const { login: friend } = useParams();
  const [msg, setMsg] = useState('');
  const onclick = async () => {
    const res = await fetch(`${API}/user/${user}/friend/${friend}`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    setMsg(data.message);
  };
  return (
    <Row>
      <Button onClick={onclick}>Toggle Friend</Button>
      <span>{msg}</span>
    </Row>
  );
};

export default AddFriend;
