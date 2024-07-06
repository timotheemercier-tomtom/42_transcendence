import { useEffect, useState } from 'react';
import { socket } from '../chat.socket';
import { ChatServerEventData } from 'common';
import { useNavigate } from 'react-router-dom';
import { getLogin } from '../util';
import { Modal, Typography, Button, Box } from '@mui/material';
import Row from './Row';

const InviteReceiver = () => {
  const nav = useNavigate();
  const [invite, setInvite] = useState<null | [string, string]>();
  const user = getLogin();
  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    console.log('adding listeneres');

    const onmessage = (e: ChatServerEventData['message']) => {
      console.log('push', e);

      if (
        e.room.startsWith('+') &&
        user != e.user &&
        e.msg.startsWith('invite ')
      ) {
        const room = e.msg.slice('invite '.length);
        console.log(room, e);
        setInvite([e.user, '/r/' + room]);
      }
    };

    socket.on('message', onmessage);

    return () => {
      console.log('removing listeneres');

      socket.off('message', onmessage);
    };
  }, [user]);

  const modalstyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={!!invite} onClose={() => setInvite(null)}>
      <Box sx={modalstyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {invite?.[0]} has invited you to a game!
        </Typography>
        <Row>
          <Button onClick={() => setInvite(null)}>Reject</Button>
          <Button
            onClick={() => {
              nav(invite?.[1] ?? '');
              setInvite(null);
            }}
          >
            Accept
          </Button>
        </Row>
      </Box>
    </Modal>
  );
};

export default InviteReceiver;
