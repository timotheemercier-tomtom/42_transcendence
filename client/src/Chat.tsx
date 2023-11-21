import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io("http://localhost:3000/chat/ws", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("message", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      newSocket.disconnect();
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
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
