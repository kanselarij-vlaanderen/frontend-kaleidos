import moment from 'moment';

// * NOTE * We use '\t\n' as newline to prevent outlook from removing extra line breaks with just '\n'

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

export {
  translationRequestEmail,
  proofRequestEmail
};
