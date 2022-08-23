import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  ADMIN,
  KANSELARIJ,
  MINISTER,
  KABINET,
  OVERHEID,
  OVRB,
  KORT_BESTEK,
  USER,
} = CONSTANTS.ACCOUNT_GROUPS;

const groupRoles = new Map();

// NOTE: When adding a new role: A good role name is something that fits in the sentence:
// "Users of the <insert group>-group are allowed to <...>"

// Available roles are:
// - manage-signatures: currently everything related to digital signing. Will be detailed later
//     in order to distinguish people that should prepare the flow, effectively sign, etc
// - search-publication-flows

groupRoles.set(ADMIN, [
  'manage-signatures',
  'manage-agenda-versions',
  'manage-agendaitems',
  'manage-meetings',
  'manage-document-access-levels',
  'manage-publication-flows',
  'search-publication-flows',
  'manage-newsletter-infos',
  'manage-decision-publications',
  'manage-document-publications',
  'manage-themis-publications',
  'manage-settings',
]);

groupRoles.set(KANSELARIJ, [
  'manage-signatures',
  'manage-agenda-versions',
  'manage-agendaitems',
  'manage-meetings',
  'manage-document-access-levels',
  'manage-newsletter-infos',
  'manage-decision-publications',
  'manage-document-publications',
  'manage-themis-publications',
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
  'manage-publication-flows',
  'search-publication-flows',
]);

groupRoles.set(KORT_BESTEK, [
  'manage-newsletter-infos',
  'manage-themis-publications',
]);

groupRoles.set(USER, [
]);

export default groupRoles;
