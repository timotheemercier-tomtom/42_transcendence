import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';

export default function Room() {
  const { id = '' } = useParams();

  return (
    <div>
      <Chat id={id}></Chat>
    </div>
  );
}
