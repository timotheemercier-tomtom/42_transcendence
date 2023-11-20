import {
  useState,
  useEffect,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";

export default function Chat() {
  const [messages, setMessages] = useState<any>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:3000/chat/ws");

    socket.onopen = () => {
      console.log("Connected to the server");
    };

    socket.onmessage = (event) => {
      setMessages((prevMessages: any) => [...prevMessages, event.data]);
    };

    socket.onclose = () => {
      console.log("Disconnected from the server");
    };

    setWs(socket);

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input.trim()) {
      ws.send(input);
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
        {messages.map((message: any, index: any) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
