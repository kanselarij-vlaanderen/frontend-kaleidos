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

async function buildContactInformation(contactPersons) {
  const contactLines = await Promise.all(
    contactPersons.map(async (contact) => {
      const person = await contact.person;
      let contactLine = `- ${person.fullName}`;
      if (contact.email) {
        contactLine += ` (${contact.email})`;
      }
      return contactLine;
    })
  );
  let message = '\nContactpersonen:\t\n';
  message += contactLines.join('\n') + '\n';
  return message;
}
async function translationRequestEmail(params) {
  const dueDate = params.dueDate ? moment(params.dueDate).format('DD-MM-YYYY') : '-';
  const subject = `${params.identifier} - Vertaalaanvraag - ${params.shortTitle}`;
  let message= '';

  if (params.isUrgent) {
    message +=  `DRINGEND! Tegen ${dueDate} vertaling gewenst\t\n`
      + '\n';
  }

  message += 'Collega,\n'
    + '\n'
    + 'Hierbij ter vertaling:\n'
    + `VO-dossier: ${params.identifier}\n`
    + '\n'
    + `Titel: ${params.title}\t\n`
    + '\n'
    + `Uiterste vertaaldatum: ${dueDate}\t\n`
    + '\n'
    + `Aantal pagina’s: ${params.numberOfPages || ''}\t\n`
    + `Aantal woorden: ${params.numberOfWords || ''}\t\n`
    + `Aantal documenten: ${params.numberOfDocuments}\t\n`;

  if (params.contactPersons.length) {
    message += await buildContactInformation(params.contactPersons);
  }

  return {
    subject: subject,
    message: [message, footer].join('\n\n'),
  };
}

function proofRequestEmail(params) {
  let subject = '';

  if (params.isUrgent) {
    subject +=  `DRINGEND: `;
  }

  subject += `Drukproefaanvraag VO-dossier: ${params.identifier} - ${params.shortTitle}`;

   const message = 'Beste,\n'
      + '\n'
      + 'In bijlage voor drukproef:\n'
      + '\n'
      + `Titel: ${params.longTitle}\t\n`
      + '\n'
      + `VO-dossier: ${params.identifier}\n`
      + '\n'
      + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand emailadres.\t\n';
  return {
    subject: subject,
    message: [message, footer].join('\n\n'),
  };
}

function publicationRequestEmail(params) {
  const targetEndDate = params.targetEndDate ? moment(params.targetEndDate).format('DD-MM-YYYY') : '-';
  const numacNumbers = params.numacNumbers
        ? params.numacNumbers.mapBy('idName').join(', ')
        : '-';
  let subject = '';

  if (params.isUrgent) {
    subject +=  `DRINGEND: `;
  }
  subject += `Publicatieaanvraag BS-werknr: ${numacNumbers} VO-dossier: ${params.identifier}`;
  const message = 'Beste,\n'
    + '\n'
    + 'Hierbij de verbeterde drukproef :\n'
    + '\n'
    + `BS-werknummer: ${numacNumbers}\n`
    + `VO-dossier: ${params.identifier}\n`
    + '\n'
    + `De gewenste datum van publicatie is: ${targetEndDate}\t\n`
    + '\t\n'
    + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand emailadres.\t\n';
  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

export {
  translationRequestEmail,
  proofRequestEmail,
  publicationRequestEmail,
};
