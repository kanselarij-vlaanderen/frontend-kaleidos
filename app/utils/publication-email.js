import moment from 'moment';

// * NOTES *
// 1. single new line: '\t\n' (multiple just n x '\n')
// => prevent Outlook from removing extra line breaks with just '\n'
// @see {@link https://docs.microsoft.com/en-us/outlook/troubleshoot/message-body/line-breaks-are-removed-in-posts-made-in-plain-text}
// "By default, the Auto Remove Line Breaks feature in Outlook is enabled.
// This causes the line breaks to be removed. Any two or more successive
// line breaks are not removed.""
// 2. no mulitline string:
// => ensure exact representation

const footer = 'Met vriendelijke groet,\n'
  + '\n'
  + 'Vlaamse overheid\t\n'
  + 'DEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\n'
  + 'Team Ondersteuning Vlaamse Regering\t\n'
  + 'publicatiesBS@vlaanderen.be\t\n'
  + 'Koolstraat 35, 1000 Brussel\t\n';
function translationRequestEmail(params) {
  const subject = `Vertaalaanvraag VO-dossier: ${params.identifier}`;
  const message = 'Collega,\n'
    + '\n'
    + 'Hierbij ter vertaling:\n'
    + `VO-dossier: ${params.identifier}\n`
    + `Titel: ${params.title}\t\n`
    + `Uiterste vertaaldatum: ${moment(params.dueDate)
      .format('DD-MM-YYYY')}\t\n`
    + `Aantal pagina’s: ${params.totalPages || ''}\t\n`
    + `Aantal woorden: ${params.totalWords || ''}\t\n`
    + `Aantal documenten: ${params.totalDocuments}\t\n`;
  return {
    subject: subject,
    message: [message, footer].join('\n'),
  };
}

function proofRequestEmail(params) {
   const subject = `Publicatieaanvraag VO-dossier: ${params.identifier} - ${params.shortTitle}`;
   const message = 'Beste,\n'
      + '\n'
      + 'In bijlage voor drukproef:\n'
      + `Titel: ${params.longTitle}\t\n`
      + `VO-dossier: ${params.identifier}\n`
      + '\n'
      + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n';
  return {
    subject: subject,
    message: [message, footer].join('\n'),
  };
}

async function publicationRequestEmail({ publicationFlow }) {
  const identification = await publicationFlow.identification;
  const publicationNumber = identification.idName;

  const numacNumbers = await publicationFlow.numacNumbers;
  const numacNumbersString = numacNumbers.mapBy('idName').join(', ') || '-';

  const publicationSubcase = await publicationFlow.publicationSubcase;
  const targetDate = publicationSubcase.targetEndDate;
  const targetDateString = targetDate
    ? moment(targetDate).format('DD/MM/YYYY')
    : '-';

  const subject = `Verbeterde drukproef BS-werknr: ${numacNumbersString} VO-dossier: ${publicationNumber}`;
  const message =
    'Beste,\n' +
    '\n' +
    'Hierbij de verbeterde drukproef :\n' +
    '\n' +
    `BS-werknummer: ${numacNumbersString}\t\n` +
    `VO-dossier: ${publicationNumber}\n` +
    '\n' +
    `De gewenste datum van publicatie is: ${targetDateString}\n` +
    '\n' +
    'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n' +
    '\n' +
    footer;

  return {
    subject,
    message,
  };
}

export {
  translationRequestEmail,
  proofRequestEmail,
  publicationRequestEmail,
};
