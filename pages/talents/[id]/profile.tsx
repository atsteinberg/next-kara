import { gql, useQuery } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Button } from '../../../components/buttons';
import { Layout } from '../../../containers/layout';
import { ModalType, PageProps } from '../../../lib/types';
import { BasicInfo, BasicInfoEdit } from '../../../components/basic-info';
import { withTranslation } from '../../../i18n';
import { useState } from 'react';

export interface ProfilePageProps extends PageProps {
  id: string;
}

const GET_TALENT = gql`
  query GetTalent($id: String!) {
    getTalentById(id: $id) {
      id
      name {
        firstName
        lastName
      }
      gender
      fullName
      profilePic
      profession
      address {
        city
        isoCode
      }
      description
      experiences {
        id
        title
        lineOfWork
        employer {
          id
          name
          address {
            city
            isoCode
          }
        }
        duration {
          from {
            timeStamp
          }
          to {
            timeStamp
          }
        }
        description
      }
      qualifications {
        institution {
          name
        }
      }
      approbations {
        id
      }
      documents {
        id
      }
      languages {
        language
      }
      otherSkills {
        name
      }
    }
  }
`;

const ProfilePage = ({ id, t }: ProfilePageProps): React.ReactElement => {
  const { data, loading, error } = useQuery(GET_TALENT, {
    variables: {
      id,
    },
  });
  const [modal, setModal] = useState<ModalType>(ModalType.NONE);
  if (loading) return <h1>Loading</h1>;
  if (error) return <h1>Error: {error.message}</h1>;
  const {
    name,
    fullName,
    gender,
    profilePic,
    profession,
    address,
    description,
  } = data?.getTalentById;
  const displayAddress = `${address.city}, ${t(`iso.${address.isoCode}`)}`;
  const basicInfo = {
    fullName,
    name,
    profilePic,
    profession: t(`profession.${profession}-${gender}`),
    displayAddress,
    address,
    gender,
    description,
  };
  return (
    <Layout title={['profile', `Talent ${id}`]}>
      <h1>Profile Page for Talent {name.firstName + ' ' + name.lastName}</h1>
      <BasicInfo
        basicInfo={basicInfo}
        done={true}
        handleEdit={() => setModal(ModalType.BASIC_INFO)}
      />
      <BasicInfoEdit
        t={t}
        basicInfo={basicInfo}
        open={modal === ModalType.BASIC_INFO}
        onClose={() => setModal(ModalType.NONE)}
      />
      <Button href={`/talents/${id}/settings`}>To Settings</Button>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          id: 'yasbiuycdbucoiuscboiucsiousc!@',
        },
      },
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {
      id: params?.id,
    },
  };
};

export default withTranslation('common')(ProfilePage);
