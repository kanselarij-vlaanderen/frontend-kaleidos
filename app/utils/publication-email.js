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
    + '\n'
    + `VO-dossier: ${params.identifier}\n`
    + `Titel: ${params.title}\t\n`
    + `Uiterste vertaaldatum: ${moment(params.dueDate)
      .format('DD-MM-YYYY')}\t\n`
    + `Aantal pagina’s: ${params.totalPages}\t\n`
    + `Aantal woorden: ${params.totalWords}\t\n`
    + `Aantal documenten: ${params.totalDocuments}\t\n`;
  return {
    subject: subject,
    message: [message, footer].join('\n'),
  };
}

async function proofRequestEmail(params) {
  const identification = await params.publicationFlow.identification;
  const idName = identification.idName;
  const publicationFlow = params.publicationFlow;

  const numacNumbers = await publicationFlow.numacNumbers;
  const numacNumber = numacNumbers.map((number) => number.idName).join(', ') || '-';

  let subject;
  let message;

  if (params.stage === 'initial') {
    subject = `Publicatieaanvraag VO-dossier: ${idName} - ${publicationFlow.shortTitle}`;
    message = 'Beste,\n'
      + '\n'
      + 'In bijlage voor drukproef:\n'
      + `Lange Titel: ${publicationFlow.longTitle}\t\n`
      + `VO-dossier: ${idName}\n`
      + '\n'
      + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n';
  } else if (params.stage === 'extra') {
    subject = `BS-werknr: ${numacNumber} VO-dossier: ${idName} – Aanvraag nieuwe drukproef`;
    message = 'Geachte,\n'
      + '\n'
      + 'Graag een nieuwe drukproef voor:\n'
      + `BS-werknummer: ${numacNumber}\n`
      + `Lange Titel: ${publicationFlow.longTitle}\t\n`
      + `VO-dossier: ${idName}\n`
      + '\n'
      + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n';
  } else if (params.stage === 'final') {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const targetDate = publicationSubcase.targetEndDate;
    const targetDateString = targetDate ? moment(targetDate).format('DD/MM/YYYY') : '-';

    subject = `Verbeterde drukproef BS-werknr: ${numacNumber} VO-dossier: ${idName}`;
    message = 'Beste,\n'
      + '\n'
      + 'Hierbij de verbeterde drukproef :\n'
      + '\n'
      + `BS-werknummer: ${numacNumber}\n`
      + `VO-dossier: ${idName}\n`
      + '\n'
      + `De gewenste datum van publicatie is: ${targetDateString}\t\n`
      + '\n'
      + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n';
  }
  return {
    subject: subject,
    message: [message, footer].join('\n'),
  };
}

export {
  translationRequestEmail,
  proofRequestEmail
};
