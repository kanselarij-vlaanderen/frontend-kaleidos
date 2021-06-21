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
    + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaande emailadres.';
}

function proofRequestEmail(params) {
  return `Wij voorzien een publicatie voor VO-dossier ${params.identifier}.

Graag registreren we het Numac nummer dat u hiervoor voorziet en de geplande datum voor publicatie.

Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaande email adres.`;
}

export {
  translationRequestEmail,
  proofRequestEmail
};
