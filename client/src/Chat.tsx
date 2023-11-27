import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { PMessage } from "@common";

export default function Chat({ id: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<PMessage[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    // Connect to the WebSocket server
    const sock = io("http://localhost:3000/chat/ws", {
      transports: ["websocket"],
    });
    setSocket(sock);

    sock.on("message", (message: PMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      sock.disconnect();
    };
  }, []);

  const sendMessage = (): void => {
    if (socket && input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
