import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  ADMIN,
  KANSELARIJ,
  MINISTER,
  KABINET,
  OVERHEID,
  OVRB,
  USER,
} = CONSTANTS.ACCOUNT_GROUPS;

const groupRoles = new Map();

// NOTE: When adding a new role: A good role name is something that fits in the sentence:
// "Users of the <insert group>-group are allowed to <...>"

// Available roles are:
// - manage-signatures: currently everything related to digital signing. Will be detailed later
//     in order to distinguish people that should prepare the flow, effectively sign, etc

groupRoles.set(ADMIN, [
  'manage-signatures',
]);

groupRoles.set(KANSELARIJ, [
  'manage-signatures',
]);

groupRoles.set(MINISTER, [
  'manage-signatures',
]);

groupRoles.set(KABINET, [
  'manage-signatures',
]);

groupRoles.set(OVERHEID, [
  'manage-signatures',
]);

groupRoles.set(OVRB, [
  'manage-signatures',
]);

groupRoles.set(USER, [
]);

export default groupRoles;
