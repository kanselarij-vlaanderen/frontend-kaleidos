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
// - search-publication-flows
// - manage-publication-flows: General viewing and editing of publication flows
// - manage-document-access-levels: modifying document access levels
// - manage-newsletter-infos: General viewing and editing of newsletter info
// - manage-decision-publications: Publishing agenda-item decisions to other Kaleidos profiles
// - manage-document-publications: Publishing agenda-item related documents to other Kaleidos profiles
// - manage-themis-publications: Publishing newsletter-info and related documents to Themis (general public).

groupRoles.set(ADMIN, [
  'manage-signatures',
  'manage-document-access-levels',
  'manage-publication-flows',
  'search-publication-flows',
  'manage-newsletter-infos',
  'manage-decision-publications',
  'manage-document-publications',
  'manage-themis-publications',
]);

groupRoles.set(KANSELARIJ, [
  'manage-signatures',
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

groupRoles.set(USER, [
]);

export default groupRoles;
