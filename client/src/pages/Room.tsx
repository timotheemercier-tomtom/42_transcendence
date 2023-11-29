import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';

export default function Room() {
  const { id = '' } = useParams();

  return <Chat id={id}></Chat>;
}
