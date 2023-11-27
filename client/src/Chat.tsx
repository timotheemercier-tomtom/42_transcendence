import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { PMessage } from 'common';

export default function Chat({ id }: { id: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<PMessage[]>([]);
  const [input, setInput] = useState<string>('');
  useEffect(() => {
    const sock = io('http://localhost:3000/chat/ws', {
      transports: ['websocket'],
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
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.msg}</li>
        ))}
      </ul>
    </div>
  );
}
