export default [
  {
    keyName: 'shortTitle',
    translationKey: 'publications-table-short-title',
    translationKeySmall: 'publications-table-short-title-small',
    sortKey: 'short-title',
    showByDefault: true,
  },
  {
    keyName: 'comment',
    translationKey: 'publications-table-comment',
    translationKeySmall: 'publications-table-comment-small',
    showByDefault: true,
  },
  {
    keyName: 'decisionDate',
    translationKey: 'publications-table-decision-date',
    translationKeySmall: 'publications-table-decision-date-small',
    showByDefault: true,
    sortKey: 'agenda-item-treatment.start-date',
  },
  {
    keyName: 'speedProcedure',
    translationKey: 'publications-table-speed-procedure',
    translationKeySmall: 'publications-table-speed-procedure-small',
    sortKey: 'urgency-level.position',
    showByDefault: true,
  },
  {
    keyName: 'publicationNumber',
    translationKey: 'publications-table-publication-number',
    translationKeySmall: 'publications-table-publication-number-small',
    showByDefault: true,
    sortKey: 'identification.structured-identifier.local-identifier,-created',
  },
  {
    keyName: 'regulationType',
    translationKey: 'publications-table-regulation-type',
    translationKeySmall: 'publications-table-regulation-type-small',
    showByDefault: true,
    sortKey: 'regulation-type.position',
  },
  {
    keyName: 'numacNumber',
    translationKey: 'publications-table-numacnummer-bs',
    translationKeySmall: 'publications-table-numacnummer-bs-small',
    showByDefault: true,
  },
  {
    keyName: 'openingDate',
    translationKey: 'publications-table-opening-date',
    translationKeySmall: 'publications-table-opening-date-small',
    showByDefault: true,
    sortKey: 'opening-date',
  },
  {
    keyName: 'publicationTargetDate',
    translationKey: 'publications-table-publication-target-date',
    translationKeySmall: 'publications-table-publication-target-date-small',
    showByDefault: true,
    sortKey: 'publication-subcase.target-end-date',
  },
  {
    keyName: 'translationDueDate',
    translationKey: 'publications-table-translation-due-date',
    translationKeySmall: 'publications-table-translation-due-date-small',
    showByDefault: true,
    sortKey: 'translation-subcase.due-date',
  },
  {
    keyName: 'publicationDueDate',
    translationKey: 'publications-table-publication-due-date',
    translationKeySmall: 'publications-table-publication-due-date-small',
    showByDefault: true,
    sortKey: 'publication-subcase.due-date',
  },
  {
    keyName: 'publicationDate',
    translationKey: 'publications-table-publication-date',
    translationKeySmall: 'publications-table-publication-date-small',
    showByDefault: true,
    sortKey:
      'publication-subcase.publication-activities.decisions.publication-date',
  },
  {
    keyName: 'translationReceivedDate',
    translationKey: 'publications-table-translation-received-date',
    translationKeySmall: 'publications-table-translation-received-date-small',
    showByDefault: true,
    sortKey: 'translation-subcase.received-date',
  },
  {
    keyName: 'translations',
    translationKey: 'publications-table-translations',
    translationKeySmall: 'publications-table-translations-small',
    showByDefault: true,
  },
  {
    keyName: 'proofs',
    translationKey: 'publications-table-publish-proofs',
    translationKeySmall: 'publications-table-publish-proofs-small',
    showByDefault: true,
  },
  {
    keyName: 'lastEdited',
    translationKey: 'publications-table-last-edited',
    translationKeySmall: 'publications-table-last-edited-small',
    showByDefault: true,
    sortKey: 'modified',
  },
  {
    keyName: 'proofPrintCorrector',
    translationKey: 'publications-table-preview-translator',
    translationKeySmall: 'publications-table-preview-translator-small',
    showByDefault: true,
    sortKey: 'publication-subcase.proof-print-corrector',
  },
  {
    keyName: 'status',
    translationKey: 'publications-table-status',
    translationKeySmall: 'publications-table-status-small',
    showByDefault: true,
    sortKey: 'status.position,publication-status-change.started-at',
  },
  {
    keyName: 'source',
    translationKey: 'publications-table-source',
    translationKeySmall: 'publications-table-source-small',
    showByDefault: true,
  },
];
