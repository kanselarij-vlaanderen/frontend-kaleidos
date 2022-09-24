import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  ADMIN,
  SECRETARIE,
  OVRB,
  KORT_BESTEK,
  MINISTER,
  KABINET_DOSSIERBEHEERDER,
  KABINET_MEDEWERKER,
  OVERHEIDSORGANISATIE,
  VLAAMS_PARLEMENT,
} = CONSTANTS.USER_ROLES;

// NOTE: When adding a new permission: A good permission name is something that fits in the sentence:
// "Users of the <insert group>-group are allowed to <...>"

// Available permissions are:
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
// - manage-meetings: Create and update meetings
// - manage-agenda-versions: Create new agenda versions, close agenda versions, reopen old agenda versions, ...
// - manage-agendaitems: Approve all agendaitems, add new agendaitems to an agenda, ...
// - manage-decisions: Open the decisions print-overview of an agenda. TBD if this is a useful permission
// - manage-cases: Create and update cases
// - manage-users: Block and archive users

const groups = [
  {
    name: 'ADMIN',
    roles: [ ADMIN ],
    defaultRoute: 'agendas',
    permissions: [
      'manage-signatures',
      'manage-agenda-versions',
      'manage-agendaitems',
      'manage-decisions',
      'manage-cases',
      'manage-meetings',
      'manage-documents',
      'manage-document-access-levels',
      'manage-publication-flows',
      'search-publication-flows',
      'manage-newsletter-infos',
      'manage-decision-publications',
      'manage-document-publications',
      'manage-themis-publications',
      'manage-settings',
      'manage-users',
      'view-document-version-info',
    ]
  },
  {
    name: 'SECRETARIE',
    roles: [ SECRETARIE ],
    defaultRoute: 'agendas',
    permissions: [
      'manage-signatures',
      'manage-agenda-versions',
      'manage-agendaitems',
      'manage-decisions',
      'manage-cases',
      'manage-meetings',
      'manage-documents',
      'manage-document-access-levels',
      'manage-newsletter-infos',
      'manage-decision-publications',
      'manage-document-publications',
      'manage-themis-publications',
      'manage-settings',
      'view-document-version-info',
    ]
  },
  {
    name: 'OVRB',
    roles: [ OVRB ],
    defaultRoute: 'publications',
    permissions: [
      'manage-signatures',
      'manage-publication-flows',
      'search-publication-flows',
      'view-document-version-info',
    ]
  },
  {
    name: 'KORT_BESTEK',
    roles: [ KORT_BESTEK ],
    defaultRoute: 'newsletters',
    permissions: [
      'manage-newsletter-infos',
      'manage-themis-publications',
    ],
  },
  {
    name: 'MINISTER',
    roles: [ MINISTER ],
    defaultRoute: 'agendas',
    permissions: [
      'manage-signatures',
      'view-document-version-info',
    ],
  },
  {
    name: 'KABINET',
    roles: [ KABINET_DOSSIERBEHEERDER, KABINET_MEDEWERKER ],
    defaultRoute: 'agendas',
    permissions: [
      'view-document-version-info',
    ],
  },
  {
    name: 'OVERHEID',
    roles: [ OVERHEIDSORGANISATIE, VLAAMS_PARLEMENT ],
    defaultRoute: 'agendas',
    permissions: [],
  },
];

export default groups;

export function findGroupByRole(role) {
  return groups.find(g => g.roles.includes(role));
}
