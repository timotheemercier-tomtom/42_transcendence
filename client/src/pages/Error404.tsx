import Col from '../components/Col';

export default function Error404() {
  return (
    <Col flexGrow={1} justifyContent={'center'} alignItems={'center'}>
      <h1>Error 404</h1>
      <span>Not Found</span>
    </Col>
  );
}
