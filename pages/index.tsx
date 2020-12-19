import { Button } from '../components/buttons';
import { Layout } from '../containers/layout';

export default function Home(): React.ReactNode {
  return (
    <Layout title="Home" home>
      <Button href="/signin" color="primary" variant="contained">
        sign in
      </Button>
      <Button href="/signup" color="secondary" variant="contained">
        sign up
      </Button>
    </Layout>
  );
}
