import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { PMessage } from 'common';
import { Button, TextField } from '@mui/material';
import Col from './Col';
import Row from './Row';

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function Chat({ id }: { id: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<PMessage[]>([]);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    const sock = io('http://localhost:3000/chat/ws', {
      transports: ['websocket'],
      query: {
        token: getCookie('accessToken'),
      },
    });
    setSocket(sock);

    sock.on('message', (message: PMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    sock.on('connect', () => {
      sock.emit('join', id);
    });

    return () => {
      sock.disconnect();
    };
  }, [id]);

  const sendMessage = (): void => {
    if (socket && input.trim()) {
      const msg: PMessage = { msg: input, room: id };
      socket.emit('message', msg);
      setInput('');
    }
  };

  return (
    <Col border={1} flexGrow={1}>
      <Col flexGrow={1} overflow={'scroll'}>
        {messages.map((v, i) => (
          <span key={i}>{v.msg}</span>
        ))}
      </Col>
      <Row>
        <TextField
          value={input}
          fullWidth
          variant="standard"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </Row>
    </Col>
  );
}
