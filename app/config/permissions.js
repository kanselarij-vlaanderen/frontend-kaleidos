import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  ADMIN,
  KANSELARIJ,
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
// - manage-news-items: General viewing and editing of news items
// - manage-decision-publications: Publishing agenda-item decisions to other Kaleidos profiles
// - manage-document-publications: Publishing agenda-item related documents to other Kaleidos profiles
// - manage-themis-publications: Publishing news-items and related documents to Themis (general public).
// - manage-meetings: Create and update meetings
// - manage-agenda-versions: Create new agenda versions, close agenda versions, reopen old agenda versions, ...
// - manage-agendaitems: Approve all agendaitems, add new agendaitems to an agenda, ...
// - manage-decisions: Change the decision result, upload a decision report
// - manage-cases: Create and update cases
// - manage-users: Block and archive users
// - manage-system-alerts: Manage systeem notifications to be shown in the application
// - view-document-version-info: View info related to document versioning. Is this this a recent addition? Older versions, ...
// - view-documents-before-release: allow the viewing of documents before they are released internally
// - view-decisions-before-release: allow the viewing of decisions before they are released internally
// - impersonate-users: Use the app as if you were a different user, without logging it with their credentials

const groups = [
  {
    name: 'ADMIN',
    roles: [ADMIN],
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
      'manage-news-items',
      'manage-decision-publications',
      'manage-document-publications',
      'manage-themis-publications',
      'manage-settings',
      'manage-users',
      'manage-alerts',
      'view-document-version-info',
      'view-documents-before-release',
      'view-decisions-before-release',
      'impersonate-users',
    ]
  },
  {
    name: 'KANSELARIJ',
    roles: [KANSELARIJ],
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
      'manage-news-items',
      'manage-decision-publications',
      'manage-document-publications',
      'manage-themis-publications',
      'view-document-version-info',
      'view-documents-before-release',
      'view-decisions-before-release',
    ]
  },
  {
    name: 'SECRETARIE',
    roles: [SECRETARIE],
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
      'manage-news-items',
      'manage-decision-publications',
      'manage-document-publications',
      'manage-themis-publications',
      'manage-settings',
      'view-document-version-info',
      'view-documents-before-release',
      'view-decisions-before-release',
    ]
  },
  {
    name: 'OVRB',
    roles: [OVRB],
    defaultRoute: 'publications',
    permissions: [
      'manage-signatures',
      'manage-publication-flows',
      'search-publication-flows',
      'view-document-version-info',
      'view-documents-before-release',
      'view-decisions-before-release',
    ]
  },
  {
    name: 'KORT_BESTEK',
    roles: [KORT_BESTEK],
    defaultRoute: 'newsletters',
    permissions: [
      'manage-news-items',
      'manage-themis-publications',
      'view-documents-before-release',
      'view-decisions-before-release',
    ],
  },
  {
    name: 'MINISTER',
    roles: [MINISTER],
    defaultRoute: 'agendas',
    permissions: [
      'manage-signatures',
      'view-document-version-info',
      'view-documents-before-release',
    ],
  },
  {
    name: 'KABINET',
    roles: [KABINET_DOSSIERBEHEERDER, KABINET_MEDEWERKER],
    defaultRoute: 'agendas',
    permissions: [
      'view-document-version-info',
      'view-documents-before-release',
    ],
  },
  {
    name: 'OVERHEID',
    roles: [OVERHEIDSORGANISATIE, VLAAMS_PARLEMENT],
    defaultRoute: 'agendas',
    permissions: [],
  },
];

export default groups;

export function findGroupByRole(role) {
  return groups.find(g => g.roles.includes(role));
}
