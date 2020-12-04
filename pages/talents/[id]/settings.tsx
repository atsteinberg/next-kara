import { getStaticPaths, getStaticProps } from './profile';
import { LinkedButton } from '../../../components/buttons';
import { Layout } from '../../../containers/layout';

export interface SettingsPageProps {
  id: string;
}

const SettingsPage = ({ id }: SettingsPageProps): React.ReactElement => {
  return (
    <Layout title={['settings', `Talent ${id}`]}>
      <h1>Settings Page for Talent {id}</h1>
      <LinkedButton href={`/talents/${id}/profile`}>To Profile</LinkedButton>
    </Layout>
  );
};

export { getStaticPaths, getStaticProps };

export default SettingsPage;