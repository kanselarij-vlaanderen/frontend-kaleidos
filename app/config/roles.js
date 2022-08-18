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
// - manage-documents: modifying document details, uploading new versions, removing.
// - manage-document-access-levels: modifying document access levels
// - manage-newsletter-infos: General viewing and editing of newsletter info
// - manage-decision-publications: Publishing agenda-item decisions to other Kaleidos profiles
// - manage-document-publications: Publishing agenda-item related documents to other Kaleidos profiles
// - manage-themis-publications: Publishing newsletter-info and related documents to Themis (general public).
// - view-document-version-info: View info related to document versioning. Is this this a recent addition? Older versions, ...

groupRoles.set(ADMIN, [
  'manage-signatures',
  'manage-documents',
  'manage-document-access-levels',
  'manage-publication-flows',
  'search-publication-flows',
  'manage-newsletter-infos',
  'manage-decision-publications',
  'manage-document-publications',
  'manage-themis-publications',
  'view-document-version-info',
]);

groupRoles.set(KANSELARIJ, [
  'manage-signatures',
  'manage-documents',
  'manage-document-access-levels',
  'manage-newsletter-infos',
  'manage-decision-publications',
  'manage-document-publications',
  'manage-themis-publications',
  'view-document-version-info',
]);

groupRoles.set(MINISTER, [
  'manage-signatures',
  'view-document-version-info',
]);

groupRoles.set(KABINET, [
  'manage-signatures',
  'view-document-version-info',
]);

groupRoles.set(OVERHEID, [
  'manage-signatures',
]);

groupRoles.set(OVRB, [
  'manage-signatures',
  'manage-publication-flows',
  'search-publication-flows',
  'view-document-version-info',
]);

groupRoles.set(USER, [
]);

export default groupRoles;
