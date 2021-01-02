import { gql, useQuery } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Button } from '../../../components/buttons';
import { Layout } from '../../../containers/layout';
import { Experience, ModalType, PageProps } from '../../../lib/types';
import { BasicInfo, BasicInfoEdit } from '../../../components/basic-info';
import { ExperienceSection } from '../../../components/experience-section/ExperienceSection';
import { withTranslation } from '../../../i18n';
import { useState } from 'react';

export interface ProfilePageProps extends PageProps {
  id: string;
}

// const GET_TALENT = gql`
//   query GetTalent($id: String!) {
//     getTalentById(id: $id) {
//       id
//       name {
//         firstName
//         middleName
//         lastName
//       }
//       gender
//       fullName
//       profilePic
//       profession
//       address {
//         city
//         isoCode
//       }
//       description
//       experiences {
//         id
//         title
//         lineOfWork
//         employer {
//           id
//           name
//           address {
//             city
//             isoCode
//           }
//         }
//         duration {
//           from {
//             timeStamp
//           }
//           to {
//             timeStamp
//           }
//         }
//         description
//       }
//       qualifications {
//         institution {
//           name
//         }
//       }
//       approbations {
//         id
//       }
//       documents {
//         id
//       }
//       languages {
//         language
//       }
//       otherSkills {
//         name
//       }
//     }
//   }
// `;
const GET_BASIC_INFO = gql`
  query GetTalentWithFragment($id: String!) {
    getTalentById(id: $id) {
      id
      basicInfo {
        id
        name {
          firstName
          middleName
          lastName
        }
        fullName
        gender
        profilePic
        profession
        address {
          city
          isoCode
        }
        description
        isBasicInfoComplete
      }
      experiences {
        id
        talent {
          id
        }
        title
        lineOfWork
        employer {
          id
          title
          address {
            city
            isoCode
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
      }
    }
  }
`;

const ProfilePage = ({ id, t }: ProfilePageProps): React.ReactElement => {
  const { data, loading, error } = useQuery(GET_BASIC_INFO, {
    variables: {
      id,
    },
  });
  const [modal, setModal] = useState<ModalType>(ModalType.NONE);
  if (loading) return <h1>Loading</h1>;
  if (error) return <h1>Error: {error.message}</h1>;
  const basicInfo = data.getTalentById.basicInfo;
  const experiences: Experience[] = data.getTalentById.experiences;

  const handleModalClose = (): void => {
    setModal(ModalType.NONE);
  };
  console.log(data.getTalentById);

  return (
    <Layout title={['profile', `Talent ${id}`]}>
      <h1>Profile Page for Talent {basicInfo.fullName}</h1>
      <BasicInfo
        t={t}
        basicInfo={basicInfo}
        handleEdit={() => setModal(ModalType.BASIC_INFO)}
      />
      <BasicInfoEdit
        t={t}
        basicInfo={basicInfo}
        open={modal === ModalType.BASIC_INFO}
        onClose={handleModalClose}
      />
      <ExperienceSection
        t={t}
        experiences={experiences}
        handleEdit={() => setModal(ModalType.EXPERIENCE)}
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
