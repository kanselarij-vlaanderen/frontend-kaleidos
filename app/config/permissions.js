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

// Each permissions object has 2 arrays:
// readOnly: for user agents that support read-only mode or better (mobile & tablet)
// full: for user agents that support all actions
// each permission should only appear in 1 array per user group

// Available permissions are:
// ADMIN-only (emergency actions that will remove data that was already spread to other profiles):
// - remove-approved-agendaitems: Remove an approved agendaitem that are already spread to other profiles.
// - reopen-approved-agenda-version: Remove the current design agenda and restore the last approved agenda to designagenda.
// - remove-approved-agenda: Remove an approved agenda.
// - edit-documents-with-ongoing-signature: can edit documents that are past the stage of marking.
// Other permissions
// - manage-signatures: currently everything related to digital signing. Will be detailed later
//     in order to distinguish people that should prepare the flow, effectively sign, etc
// - manage-only-specific-signatures: allow the profile to only create signing flows for their own mandatee.
// - view-all-ongoing-signatures: allow the profile to view ongoing sign-flows from other creators
// - remove-signatures: Remove the signed piece and all data of a sign-flow
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
// - manage-retracted-agendaitems: Re-propose retracted agendaitems
// - manage-press-agenda: Allow access to press agenda action
// - manage-decisions: Change the decision result, upload a decision report
// - manage-cases: Create and update cases
// - manage-users: Block and archive users
// - manage-alerts: Manage systeem notifications to be shown in the application
// - manage-minutes: Create and update minutes for a meeting
// - manage-secretary-signatures: Create and follow-up sign-flows for documents to be signed by secretaries
// - manage-ratification: Can add ratification docs and select mandatees who should sign it
// - add-past-mandatees: Adding past mandatees on subcases
// - view-document-version-info: View info related to document versioning. Is this this a recent addition? Older versions, ...
// - view-documents-before-release: allow the viewing of documents before they are released internally
// - view-decisions-before-release: allow the viewing of decisions before they are released internally
// - view-all-confidential-documents: allow the viewing of confidential documents in your graph
// - view-only-specific-confidential-documents: allow the viewing of a restricted selection of confidential documents.
// - view-ratification-before-release: See ratification info before the agenda is finalized
// - search-confidential-cases: allow searching of cases that have at least 1 confidential subcase
// - search-confidential-documents: allow searching of documents that have vertrouwelijk access level
// - send-cases-to-vp: allow sending a case's documents to the VP (Flemish Parliament).
// - send-only-specific-cases-to-vp: allow sending a restricted selection of cases' documents to the VP (Flemish Parliament).
// - impersonate-users: Use the app as if you were a different user, without logging it with their credentials
// - view-documents-postponed-and-retracted: Allow viewing the documents of retracted or postponed agendaitems
// - view-mandatees-with-range: Allow the viewing of the startDate and endDate for mandatees in agendaitem and subcase views
// - create-submissions: Allow the creation of submissions (by cabinets)
// - treat-and-accept-submissions: Allow the treating of submissions on placing the agenda
// - view-submissions: Allow the viewing of submissions in general
// - view-all-submissions: Allow the viewing of all submissions, regardless of the related mandatee
// - always-edit-submissions: Allow editing submissions regardless of status
// - edit-in-treatment-submissions: Allow editing submissions when they have the In treatment status
// - edit-sent-back-submissions: Allow editing submission when they have the Sent back status
// - create-subcases-from-submissions: Allow creating a real subcase (and pieces, files, ...) from a submission
// - delete-submissions

const groups = [
  {
    name: 'ADMIN',
    roles: [ADMIN],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
        'view-all-ongoing-signatures',
        'search-publication-flows',
        'view-document-version-info',
        'view-documents-before-release',
        'view-decisions-before-release',
        'view-all-confidential-documents',
        'view-ratification-before-release',
        'search-confidential-cases',
        'search-confidential-documents',
        'impersonate-users',
        'view-documents-postponed-and-retracted',
        'view-mandatees-with-range',
        'view-access-level-pill-when-postponed',
        'view-submissions',
        'view-all-submissions',
      ],
      full: [
        'remove-approved-agendaitems',
        'reopen-approved-agenda-version',
        'remove-approved-agenda',
        'edit-documents-with-ongoing-signature',
        'manage-signatures',
        'remove-signatures',
        'manage-agenda-versions',
        'manage-agendaitems',
        'manage-retracted-agendaitems',
        'manage-decisions',
        'manage-ratification',
        'manage-cases',
        'manage-meetings',
        'manage-documents',
        'manage-document-access-levels',
        'manage-publication-flows',
        'manage-news-items',
        'manage-decision-publications',
        'manage-document-publications',
        'manage-themis-publications',
        'manage-press-agenda',
        'manage-settings',
        'manage-users',
        'manage-alerts',
        'manage-minutes',
        'manage-secretary-signatures',
        'add-past-mandatees',
        'send-cases-to-vp',
        'treat-and-accept-submissions',
        'always-edit-submissions',
        'edit-in-treatment-submissions',
        'create-subcases-from-submissions',
        'delete-submissions',
      ]
    }
  },
  {
    name: 'KANSELARIJ',
    roles: [KANSELARIJ],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
      'view-all-ongoing-signatures',
      'search-publication-flows',
      'view-document-version-info',
      'view-documents-before-release',
      'view-decisions-before-release',
      'view-all-confidential-documents',
      'view-ratification-before-release',
      'search-confidential-cases',
      'search-confidential-documents',
      'view-documents-postponed-and-retracted',
      'view-mandatees-with-range',
      'view-access-level-pill-when-postponed',
      'view-submissions',
      'view-all-submissions',
      ],
      full: [
        'manage-signatures',
        'remove-signatures',
        'manage-agenda-versions',
        'manage-agendaitems',
        'manage-decisions',
        'manage-ratification',
        'manage-cases',
        'manage-meetings',
        'manage-documents',
        'manage-document-access-levels',
        'manage-publication-flows',
        'manage-news-items',
        'manage-decision-publications',
        'manage-document-publications',
        'manage-themis-publications',
        'manage-press-agenda',
        'manage-minutes',
        'manage-secretary-signatures',
        'add-past-mandatees',
        'treat-and-accept-submissions',
        'edit-in-treatment-submissions',
        'create-subcases-from-submissions',
      ]
    }
  },
  {
    name: 'SECRETARIE',
    roles: [SECRETARIE],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
        'view-all-ongoing-signatures',
        'view-document-version-info',
        'view-documents-before-release',
        'view-decisions-before-release',
        'view-all-confidential-documents',
        'search-confidential-cases',
        'search-confidential-documents',
        'view-documents-postponed-and-retracted',
        'view-mandatees-with-range',
        'view-access-level-pill-when-postponed',
        'view-submissions',
        'view-all-submissions',
      ],
      full: [
        'manage-signatures',
        'remove-signatures',
        'manage-agenda-versions',
        'manage-agendaitems',
        'manage-decisions',
        'manage-ratification',
        'manage-cases',
        'manage-meetings',
        'manage-documents',
        'manage-document-access-levels',
        'manage-news-items',
        'manage-decision-publications',
        'manage-document-publications',
        'manage-themis-publications',
        'manage-press-agenda',
        'manage-minutes',
        'manage-secretary-signatures',
        'add-past-mandatees',
        'treat-and-accept-submissions',
        'edit-in-treatment-submissions',
        'create-subcases-from-submissions',
      ]
    }
  },
  {
    name: 'OVRB',
    roles: [OVRB],
    defaultRoute: 'publications',
    permissions: {
      readOnly: [
        'view-all-ongoing-signatures',
        'view-document-version-info',
        'view-documents-before-release',
        'view-decisions-before-release',
        'view-all-confidential-documents',
        'view-ratification-before-release',
        'search-confidential-cases',
        'search-confidential-documents',
        'view-documents-postponed-and-retracted',
        'search-publication-flows',
      ],
      full: [
        'manage-signatures',
        'manage-ratification',
        'manage-publication-flows',
        'add-past-mandatees',
      ]
    }
  },
  {
    name: 'KORT_BESTEK',
    roles: [KORT_BESTEK],
    defaultRoute: 'newsletters',
    permissions: {
      readOnly: [
        'view-document-version-info',
        'view-documents-before-release',
        'view-decisions-before-release',
        'view-all-confidential-documents',
        'view-ratification-before-release',
        'view-documents-postponed-and-retracted',
        'search-confidential-cases',
        'search-confidential-documents',
      ],
      full: [
        'manage-news-items',
        'manage-themis-publications',
      ]
    }
  },
  {
    name: 'MINISTER',
    roles: [MINISTER],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
        'view-document-version-info',
        'view-documents-before-release',
        'view-documents-postponed-and-retracted',
        'view-all-confidential-documents',
        'view-submissions',
        'view-all-submissions',
      ],
      full: [
        'manage-signatures',
        'manage-only-specific-signatures',
        'send-only-specific-cases-to-vp',
        'create-submissions',
        'edit-sent-back-submissions',
      ]
    }
  },
  {
    name: 'KABINET_DOSSIERBEHEERDER',
    roles: [KABINET_DOSSIERBEHEERDER],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
        'view-document-version-info',
        'view-documents-before-release',
        'view-only-specific-confidential-documents',
        'view-documents-postponed-and-retracted',
        'view-submissions',
      ],
      full: [
        'manage-signatures',
        'manage-only-specific-signatures',
        'send-only-specific-cases-to-vp',
        'create-submissions',
        'edit-sent-back-submissions',
      ]
    }
  },
  {
    name: 'KABINET_MEDEWERKER',
    roles: [KABINET_MEDEWERKER],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [
        'view-document-version-info',
        'view-documents-before-release',
        'view-documents-postponed-and-retracted',
        'view-submissions',
      ],
      full: []
    }
  },
  {
    name: 'OVERHEID',
    roles: [OVERHEIDSORGANISATIE, VLAAMS_PARLEMENT],
    defaultRoute: 'agendas',
    permissions: {
      readOnly: [],
      full: []
    }
  },
];

export default groups;

export function findGroupByRole(role) {
  return groups.find(g => g.roles.includes(role));
}
