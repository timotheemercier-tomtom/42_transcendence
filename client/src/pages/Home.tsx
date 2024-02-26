export default function Home() {
  return <div>Home page , pong!</div>;
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
