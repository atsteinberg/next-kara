import { models } from '../db';
import {
  UserInput,
  User,
  Talent,
  Organization,
  TalentUpdate,
  Experience,
  TalentAssetEntry,
  BaseEntity,
} from '../lib/types';
import { nanoid } from 'nanoid';
import { filterById } from '../lib/utils/arrays';

const handleError = (e: Error): Error => {
  console.error(e); //eslint-disable-line no-console
  return e;
};

//eslint-disable-next-line @typescript-eslint/ban-types
const updateObject = (object: object, update: object | undefined): object => {
  if (!update) return object;
  return { ...object, ...update };
};

const getExperienceById = (
  talent: Talent | undefined,
  id: string,
): Experience | null => {
  if (!talent) return null;
  if (!talent.experiences.length) return null;
  return (filterById(talent.experiences, id) as Experience | undefined) || null;
};

export const getAllTalentIds = (): string[] =>
  models.Talent.findMany().map((talent: User) => talent.id);

export const getAllEmployerIds = (): string[] =>
  models.Employer.findMany().map((employer: User) => employer.id);

export const getAllUserIds = (): string[] => {
  const talents = getAllTalentIds.call(null);
  const employers = getAllEmployerIds();
  return talents.concat(employers);
};

export const getTalentById = async (id: string): Promise<Talent> => {
  return await models.Talent.findOne({ id });
};

export const getOrganizationById = async (
  id: string,
): Promise<Organization> => {
  return await models.Organization.findOne({ id });
};

export const addUser = async (input: UserInput): Promise<User> => {
  const type =
    input.type === 'TALENT'
      ? 'Talent'
      : input.type === 'EMPLOYER'
      ? 'Employer'
      : 'Agency';
  const oldUser = models[type].findOne({
    email: input.email,
  });
  if (oldUser) throw new Error('user already exists');
  return await models[type].createOne(input);
};

const getOrCreateOrganizationId = async (
  organization: Organization | undefined,
): Promise<string | undefined> => {
  try {
    const existingEntry = await models.Organization.findOne(organization);
    if (existingEntry) return existingEntry.id;
    const newOrganization = await models.Organization.createOne(organization);
    return newOrganization.id;
  } catch (e) {
    handleError(e);
  }
};

export const addExperience = async (
  input: Partial<Experience> & TalentAssetEntry,
): Promise<Talent | null> => {
  const talent = await models.Talent.findOne({ id: input.talent });
  if (!talent) throw new Error(`no user with id ${input.talent}`);
  const id = nanoid();
  const newExperience = {
    id,
    ...input,
    employer: await getOrCreateOrganizationId(input.employer),
  };
  let updatedTalent: Talent | undefined;
  try {
    updatedTalent = await models.Talent.updateOne(
      { id: talent.id },
      { experiences: [...talent.experiences, newExperience] },
    );
  } catch (e) {
    handleError(e);
  }
  return updatedTalent || null;
};

export const updateExperience = async (
  input: Partial<Experience> & TalentAssetEntry & BaseEntity,
): Promise<Talent | null> => {
  let talent: Talent | undefined;
  try {
    talent = await models.Talent.findOne({ id: input.talent });
  } catch (e) {
    handleError(e);
  }
  const oldExperience: Experience | null = getExperienceById(talent, input.id);
  if (!oldExperience) return null;
  const updatedExperience = {
    ...oldExperience,
    lineOfWork: input.lineOfWork,
    employer: await getOrCreateOrganizationId(input.employer),
    duration: input.duration,
    description: input.description,
  };
  const otherExperiences =
    talent?.experiences.filter((experience) => experience.id !== input.id) ||
    [];
  const updatedExperiences = [
    ...otherExperiences,
    updatedExperience,
  ] as Experience[];
  try {
    talent = await models.Talent.updateOne(
      { id: input.talent },
      { ...talent, experiences: updatedExperiences },
    );
  } catch (e) {
    handleError(e);
  }
  return talent || null;
};

export const updateTalent = async (input: TalentUpdate): Promise<Talent> => {
  const existingTalent = models.Talent.findOne({
    id: input.id,
  });
  if (!existingTalent)
    throw new Error(`no user with id ${input.id} in database`);
  let updatedTalent;
  // const updatedAddress = { ...existingTalent.address, ...input.address };
  // const updatedName = { ...existingTalent.name, ...input.name };
  const enrichedInput = {
    ...input,
    address: updateObject(existingTalent.address, input.address),
    name: updateObject(existingTalent.name, input.name),
  };
  try {
    updatedTalent = await models.Talent.updateOne(
      { id: input.id },
      enrichedInput,
    );
  } catch (err) {
    handleError(err);
  }
  return updatedTalent;
};

export const isBasicInfoComplete = (talent: Talent): boolean => {
  return Boolean(
    talent.name?.lastName &&
      talent.name?.lastName !== '' &&
      talent.address?.city !== '' &&
      talent.address?.city &&
      talent.address?.isoCode &&
      talent.address?.isoCode !== null &&
      talent.description &&
      talent.description !== '' &&
      talent.profilePic &&
      talent.profilePic !== '',
  );
};

export const getFullName = (talent: Talent): string => {
  return `${talent.name.firstName} ${
    talent.name.middleName ? talent.name.middleName + ' ' : ''
  }${talent.name.lastName}`;
};

export const isExperienceComplete = async (
  experience: Experience,
): Promise<boolean> => {
  return Boolean(
    experience.description &&
      experience.duration &&
      experience.employer &&
      experience.lineOfWork,
  );
};

export const deleteExperience = async ({
  talent: talentId,
  id,
}: {
  talent: string;
  id: string;
}): Promise<Talent | null> => {
  let talent: Talent | null = null;
  try {
    const oldTalent: Talent = await models.Talent.findOne({ id: talentId });
    const newExperiences = oldTalent?.experiences.filter(
      (experience) => experience.id !== id,
    );
    talent = await models.Talent.updateOne(
      { id: talentId },
      { experiences: newExperiences },
    );
  } catch (e) {
    handleError(e);
  }
  return talent;
};
