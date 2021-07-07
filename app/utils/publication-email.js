import moment from 'moment';

function translationRequestEmail(params) {
  return 'Collega,\n'
    + '\n'
    + 'In bijlage document(en) die wij indienen voor vertaling.\n'
    + '\n'
    + 'Het betreft:\n'
    + '\n'
    + `VO-dossier: ${params.identifier}\n`
    + `Titel: ${params.title}\n`
    + `Uiterste vertaaldatum: ${moment(params.dueDate).format('DD-MM-YYYY')}\n`
    + `Aantal pagina’s: ${params.totalPages}\n`
    + `Aantal woorden: ${params.totalWords}\n`
    + `Aantal documenten: ${params.totalDocuments}\n`
    + '\n'
    + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand e-mailadres.';
}

async function proofRequestEmail(params) {
  if (params.stage === 'initial') {
    const identification = await params.publicationFlow.identification;
    const idName = identification.idName;

    const subject = `Publicatieaanvraag VO-dossier: ${idName}`;
    const message =  `Wij voorzien een publicatie voor VO-dossier ${idName}.

Graag registreren we het Numac-nummer dat u hiervoor voorziet, en de geplande datum voor publicatie.

Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand e-mailadres.`;

    return {
      subject: subject,
      message: message,
    };
  } else if (params.stage === 'final') {
    const publicationFlow = params.publicationFlow;

    const identification = await publicationFlow.identification;
    const idName = identification.idName;

    const numacNumbers = await publicationFlow.numacNumbers;
    const numacNumber = numacNumbers.firstObject?.idName ?? '?';

    const publicationSubcase = await publicationFlow.publicationSubcase;
    const targetDate = publicationSubcase.targetEndDate;
    const targetDateString = targetDate ? moment(targetDate).format('DD/MM/YYYY') : '?';

    const subject = `Finale publicatie voor publicatie BS-werknr: ${numacNumber}, VO-dossier: ${idName}`;
    const message = `Geachte,

Graag gaan we over tot het publiceren van de finale publicatie in bijlage voor het dossier:

BS-werknummer: ${numacNumber}
VO-dossier: ${idName}
Korte Titel: ${publicationFlow.shortTitle}
Lange Titel: ${publicationFlow.longTitle}

De gewenste datum van publicatie is: ${targetDateString}

Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaande email adres.

Met vriendelijke groeten,`;

    return {
      subject: subject,
      message: message,
    };
  }

  throw new Error(`unknown stage: ${params.stage}`);
}

export {
  translationRequestEmail,
  proofRequestEmail
};
