import Col from '../components/Col';
import GameMaker from '../components/GameMaker';

export default function Home() {
  return (
    <Col>
      <h1>Home page , pong!</h1>
      <GameMaker />
    </Col>
  );
}

// import { Component } from "react";

// import {UserService} from "../../../server/src/user/user.service";

// type Props = {};

// type State = {
//   content: string;
// }

// export default class Home extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);

//     this.state = {
//       content: ""
//     };string
//   }

//   componentDidMount() {
//     UserService.getPublicContent().then(
//         (      response: { data: any; }) => {
//         this.setState({
//           content: response.data
//         });
//       },
//         (      error: { response: { data: any; }; message: any; toString: () => any; }) => {
//         this.setState({
//           content:
//             (error.response && error.response.data) ||
//             error.message ||
//             error.toString()
//         });
//       }
//     );
//   }

//   render() {
//     return (
//       <div className="container">
//         <header className="jumbotron">
//           <h3>{this.state.content}</h3>
//         </header>
//       </div>
//     );
//   }
// }
