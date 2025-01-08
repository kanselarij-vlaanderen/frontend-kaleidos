// * NOTES *
// 1. single new line: '\t\n' (multiple just n x '\n')
// => prevent Outlook from removing extra line breaks with just '\n'
// @see {@link https://docs.microsoft.com/en-us/outlook/troubleshoot/message-body/line-breaks-are-removed-in-posts-made-in-plain-text}
// "By default, the Auto Remove Line Breaks feature in Outlook is enabled.
// This causes the line breaks to be removed. Any two or more successive
// line breaks are not removed.""
// 2. no mulitline string:
// => ensure exact representation

// ! do not use auto formatters on this file. Any whitespaces are used in the eventual text.
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from './documents';

const footer = 'Met vriendelijke groet,\n'
  + '\n'
  + 'Vlaamse overheid\t\n'
  + 'DEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\n'
  + 'Team Regeringsondersteuning – Cel Ministerraad\t\n'
  + 'VlaamseRegering_Agenderingen@groepen.vlaanderen.be\t\n'
  + 'Koolstraat 35, 1000 Brussel\t\n';

async function getAgendaitemText(params) {
  let agendaitemText = null;
  const type = await params.submission.agendaItemType;
  let typeLabel = type?.label.toLowerCase();
  agendaitemText = typeLabel;

  const number = params.agendaitem?.number;
  if (number) {
    if (params.resubmitted && type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
      agendaitemText = `agendapunt ${number}`;
    } else {
      agendaitemText = `${typeLabel} ${number}`;
    }
  }
  return agendaitemText;
}

async function getAgendaitemArticle(params) {
  const type = await params.submission.agendaItemType;
  if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
    return 'Het';
  } else {
    return 'De';
  }
}

async function getSubject(params) {
  const meetingKind = await params.meeting.kind;
  let meetingDate = dateFormat(params.meeting.plannedStart, 'dd-MM-yyyy');
  const resubmitted = params.resubmitted ? 'aanpassing' : '';
  const agendaitemText = await getAgendaitemText(params) ?? '';
  const titlePrefix = params.resubmitted
    ? ` ${resubmitted} ${agendaitemText}`
    : ` ${agendaitemText.charAt(0).toUpperCase() + agendaitemText.slice(1)}`;
  const mandatees = await params.submission.mandatees;
  let prefix = '';
  if (params.submission.confidential) {
    prefix += 'Vertrouwelijk - ';
  }
  if (mandatees?.length > 1) {
    prefix += 'Co-agendering - ';
  }
  return `${prefix}${meetingKind.label} VR ${meetingDate}:${titlePrefix} ${params.submission.shortTitle}`;
}

async function caseSubmittedEmail(params) {
  const submitter = await params.submission.requestedBy;
  const submitterPerson = await submitter.person;
  const meetingKind = await params.meeting.kind;
  const agendaitemText = await getAgendaitemText(params);

  let message = `Beste,
`;
  if (params.forSubmitter) {
    message += `
Uw ${params.resubmitted ? 'aangepaste ': ''}indiening is goed ontvangen. De volgende notificatie werd verstuurd:
`;
  }

  if (params.isForPostponedSubcase) {
    const oldMeetingKind = await params.oldMeeting?.kind?.label;
    const oldMeetingDate = dateFormat(params.oldMeeting?.plannedStart, 'dd-MM-yyyy');
    const agendaitemArticle = await getAgendaitemArticle(params);
    message += `
${agendaitemArticle} ${agendaitemText} "${params.submission.shortTitle}", uitgesteld op de ${oldMeetingKind} van ${oldMeetingDate} werd opnieuw ingediend door kabinet ${submitterPerson.lastName}
`;
  } else if (params.resubmitted) {
    if (agendaitemText) {
      message += `
Er werd een aanpassing gedaan aan ${agendaitemText} "${params.submission.shortTitle}" door kabinet ${submitterPerson.lastName}.
`;
    } else {
      message += `
Er werd een aanpassing gedaan aan het eerder ingediende "${params.submission.shortTitle}" door kabinet ${submitterPerson.lastName}.
`;
    }
  } else {
    if (agendaitemText) {
      message += `
Er werd een nieuwe ${agendaitemText} "${params.submission.shortTitle}" ingediend door kabinet ${submitterPerson.lastName}.
`;
    } else {
      message += `
Er werd een nieuwe indiening "${params.submission.shortTitle}" gedaan door kabinet ${submitterPerson.lastName}.
`;
    }
  }

  let additionalMandateeNames = [];
  const mandatees = await params.submission.mandatees;
  const sortedMandatees = mandatees.slice().sort(
    (m1, m2) => m1.priority - m2.priority
  );
  for (const mandatee of sortedMandatees) {
    if (mandatee.id !== submitter.id) {
      const mandateePerson = await mandatee.person;
      const mandate = await mandatee.mandate;
      const role = await mandate.role;
      if (role.uri === CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT) {
        additionalMandateeNames.push('minister-president ' + mandateePerson.lastName);
      } else {
        additionalMandateeNames.push('minister ' + mandateePerson.lastName);
      }
    }
  }
  if (additionalMandateeNames.length > 1) {
    const additionalMandateeString = additionalMandateeNames.slice(0, -1).join(', ') + ' en ' + additionalMandateeNames.slice(-1);
    message += `
Het betreft een co-agendering met ${additionalMandateeString}
`;

    if (params.forApprovers) {
      message += `
Kunnen de betrokken kabinetschefs hun akkoord geven via allen beantwoorden aub?
`;
    }
  } else if (additionalMandateeNames.length === 1) {
    const additionalMandateeString = additionalMandateeNames[0];
    message += `
Het betreft een co-agendering met ${additionalMandateeString}.
`;

    if (params.forApprovers) {
      message += `
Kan de betrokken kabinetschef haar/zijn akkoord geven via allen beantwoorden aub?
`;
    }
  }

  if (params.submission.confidential) {
    message += `
Het betreft een vertrouwelijke indiening.
  `;
  }

  if (meetingKind?.uri === CONSTANTS.MEETING_KINDS.PVV) {
    message += `
Het betreft een indiening in het kader van het Plan Vlaamse Veerkracht.
  `;
  }

  if (params.isUpdate) {
    const pieces = (await params.submission.pieces).slice();
    if (pieces.length) {
      message += `
Nieuwe documenten:
`;
    }
    for (const piece of await sortPieces(pieces)) {
      const previousPiece = await piece.previousPiece;

      if (previousPiece) {
        // BIS versions already have a proper VR name
        message += `
- ${piece.name}
`;
      } else {
        // Craft a sensible doc name for users with position & type
        const documentContainer = await piece.documentContainer;
        const type = await documentContainer.type;
        message += `
- ${documentContainer.position}. ${piece.name} - ${type.label}
`;
      }
    }
  }

  message += `
U kan alle informatie en documenten hier terugvinden: ${params.submissionUrl}
`;
  return message;
}

async function caseSubmittedApproversEmail(params) {
  const subject = await getSubject(params);

  let message = await caseSubmittedEmail({ ...params, forApprovers: true });
  if (params.approvalComment) {
    message += `
Aanvullende informatie:
${params.approvalComment}
`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

async function caseSubmittedIkwEmail(params) {
  const subject = await getSubject(params);

  let message = await caseSubmittedEmail(params);

  if (!params.submission.confidential && params.hasConfidentialPieces) {
    message += `
Deze ${params.resubmitted ? 'aangepaste ': ''}indiening wordt ter informatie aan de KC-groep bezorgd omdat deze één of meer vertrouwelijke documenten bevat.
  `;
  }

  if (params.notificationComment) {
    message += `
Aanvullende informatie:
${params.notificationComment}
`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

async function caseSubmittedSubmitterEmail(params) {
  const subject = await getSubject(params);

  let message = await caseSubmittedEmail({ ...params, forSubmitter: true });
  if (params.approvalComment) {
    message += `
Aanvullende informatie voor de kanselarij en de kabinetschef(s) van de co-agenderende minister(s):
${params.approvalComment}
`;
  }
  if (params.notificationComment) {
    message += `
Aanvullende informatie voor de IKW/KC-groep:
${params.notificationComment}
`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

async function caseSendBackEmail(params) {
  let subject = 'Indiening klaar voor aanpassing: ';
  subject += await getSubject(params);

  let message = '';
  message += `Beste,
`;
  if (params.comment) {
    message += `
Uw indiening "${params.submission.shortTitle}" werd teruggestuurd met volgende opmerking:
${params.comment}
`;
  } else {
    message += `
Uw indiening "${params.submission.shortTitle}" werd teruggestuurd zodat u aanpassingen kan maken.
`;
  }
  message += `
U kunt uw indiening hier aanpassen: ${params.submissionUrl}
`;

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

async function caseResubmittedApproversEmail(params) {
  return caseSubmittedApproversEmail({ ...params, resubmitted: true });
}

async function caseResubmittedIkwEmail(params) {
  return caseSubmittedIkwEmail({ ...params, resubmitted: true });
}

async function caseResubmittedSubmitterEmail(params) {
  return caseSubmittedSubmitterEmail({ ...params, resubmitted: true });
}

async function caseUpdateSubmissionApproversEmail(params) {
  return caseSubmittedApproversEmail({ ...params, resubmitted: true, isUpdate: true });
}

async function caseUpdateSubmissionIkwEmail(params) {
  return caseSubmittedIkwEmail({ ...params, resubmitted: true, isUpdate: true });
}

async function caseUpdateSubmissionSubmitterEmail(params) {
  return caseSubmittedSubmitterEmail({ ...params, resubmitted: true, isUpdate: true });
}

async function caseRequestSendBackEmail(params) {
  const submitter = await params.submission.requestedBy;
  const submitterPerson = await submitter.person;
  let subject = 'Aanpassing aangevraagd: ';
  subject += await getSubject(params);

  let message = '';
  message += `Beste,

Er werd een aanpassing aangevraagd door kabinet ${submitterPerson.lastName} voor indiening "${params.submission.shortTitle}"`;
  if (params.comment) {
    message += `met volgende opmerking:
${params.comment}
`;
  } else {
    message += `.
`;
  }
message += `
U kunt de indiening hier bekijken: ${params.submissionUrl}
`;

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

export {
  caseSubmittedApproversEmail,
  caseSubmittedIkwEmail,
  caseSubmittedSubmitterEmail,
  caseSendBackEmail,
  caseRequestSendBackEmail,
  caseResubmittedSubmitterEmail,
  caseResubmittedApproversEmail,
  caseResubmittedIkwEmail,
  caseUpdateSubmissionApproversEmail,
  caseUpdateSubmissionIkwEmail,
  caseUpdateSubmissionSubmitterEmail,
};
