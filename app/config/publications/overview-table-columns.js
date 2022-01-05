export default [
  {
    keyName: 'speedProcedure',
    translationKey: 'publications-table-speed-procedure',
    translationKeySmall: 'publications-table-speed-procedure-small',
    sortKey: 'urgency-level.position',
  },
  {
    keyName: 'publicationNumber',
    translationKey: 'publications-table-publication-number',
    translationKeySmall: 'publications-table-publication-number-small',
    sortKey: 'identification.structured-identifier.local-identifier,-created',
  },
  {
    keyName: 'numacNumber',
    translationKey: 'publications-table-numacnummer-bs',
    translationKeySmall: 'publications-table-numacnummer-bs-small',
    sortKey: 'numac-numbers.id-name,-created',
  },
  {
    keyName: 'shortTitle',
    translationKey: 'publications-table-short-title',
    translationKeySmall: 'publications-table-short-title-small',
    sortKey: 'short-title',
  },
  {
    keyName: 'comment',
    translationKey: 'publications-table-comment',
    translationKeySmall: 'publications-table-comment-small',
  },
  {
    keyName: 'pages',
    translationKey: 'publications-table-pages',
    translationKeySmall: 'publications-table-pages-small',
    // no sort: is aggregated in frontend
  },
  {
    keyName: 'decisionDate',
    translationKey: 'publications-table-decision-date',
    translationKeySmall: 'publications-table-decision-date-small',
    sortKey: 'agenda-item-treatment.start-date',
  },
  {
    keyName: 'openingDate',
    translationKey: 'publications-table-opening-date',
    translationKeySmall: 'publications-table-opening-date-small',
    sortKey: 'opening-date',
  },
  {
    keyName: 'translationRequestDate',
    translationKey: 'publications-table-translation-request-date',
    translationKeySmall: 'publications-table-translation-request-date-small',
    sortKey: 'translation-subcase.start-date',
  },
  {
    keyName: 'translationDueDate',
    translationKey: 'publications-table-translation-due-date',
    translationKeySmall: 'publications-table-translation-due-date-small',
    sortKey: 'translation-subcase.due-date',
  },
  {
    keyName: 'proofRequestDate',
    translationKey: 'publications-table-proof-request-date',
    translationKeySmall: 'publications-table-proof-request-date-small',
    sortKey: 'publication-subcase.proofing-activities.start-date',
  },
  {
    keyName: 'proofReceivedDate',
    translationKey: 'publications-table-publication-received-date',
    translationKeySmall: 'publications-table-publication-received-date-small',
    sortKey: 'publication-subcase.received-date',
  },
  {
    keyName: 'proofPrintCorrector',
    translationKey: 'publications-table-preview-translator',
    translationKeySmall: 'publications-table-preview-translator-small',
    sortKey: 'publication-subcase.proof-print-corrector',
  },
  {
    keyName: 'publicationTargetDate',
    translationKey: 'publications-table-publication-target-date',
    translationKeySmall: 'publications-table-publication-target-date-small',
    sortKey: 'publication-subcase.target-end-date',
  },
  {
    keyName: 'publicationDate',
    translationKey: 'publications-table-publication-date',
    translationKeySmall: 'publications-table-publication-date-small',
    sortKey:
      'publication-subcase.publication-activities.decisions.publication-date',
  },
  {
    keyName: 'publicationDueDate',
    translationKey: 'publications-table-publication-due-date',
    translationKeySmall: 'publications-table-publication-due-date-small',
    sortKey: 'publication-subcase.due-date',
  },
  {
    keyName: 'regulationType',
    translationKey: 'publications-table-regulation-type',
    translationKeySmall: 'publications-table-regulation-type-small',
    sortKey: 'regulation-type.position',
  },
  {
    keyName: 'source',
    translationKey: 'publications-table-source',
    translationKeySmall: 'publications-table-source-small',
  },
  {
    keyName: 'lastEdited',
    translationKey: 'publications-table-last-edited',
    translationKeySmall: 'publications-table-last-edited-small',
    sortKey: 'modified',
  },
  {
    keyName: 'status',
    translationKey: 'publications-table-status',
    translationKeySmall: 'publications-table-status-small',
    sortKey: 'status.position,publication-status-change.started-at',
  },
];
