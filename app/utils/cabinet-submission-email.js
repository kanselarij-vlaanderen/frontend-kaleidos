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

const footer = `Met vriendelijke groet,

Vlaamse overheid
DEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN
Team Regeringsondersteuning – Cel Ministerraad
ministerraad@vlaanderen.be
Koolstraat 35, 1000 Brussel
`

async function getSubject(params) {
  const meetingKind = await params.meeting.kind;
  let meetingDate = dateFormat(params.meeting.plannedStart, 'dd-MM-yyyy');
  const resubmitted = params.resubmitted ? ' aanpassing indiening' : '';
  let suffix = ''
  const mandatees = await params.submission.mandatees;
  if (mandatees?.length > 1) {
    suffix += ' – co-agendering';
  }
  if (params.submission.confidential) {
    suffix += ' – vertrouwelijk';
  }
  return `${meetingKind.label} VR ${meetingDate}:${resubmitted} ${params.submission.shortTitle}${suffix}`;
}

async function caseSubmittedEmail(params) {
  const submitter = await params.submission.requestedBy;
  const submitterPerson = await submitter.person;
  let message = `Beste,
`;
  if (params.forSubmitter) {
    message += `
Uw ${params.resubmitted ? 'aangepaste ': ''}indiening is goed ontvangen. De volgende notificatie werd verstuurd:
`;
  }

  if (params.resubmitted) {
    message += `
Er werd een aanpassing gedaan aan het eerder ingediende "${params.submission.shortTitle}" door kabinet ${submitterPerson.lastName}.
`;
  } else {
    message += `
Er werd een nieuwe indiening "${params.submission.shortTitle}" gedaan door kabinet ${submitterPerson.lastName}.
`;
  }

  if (params.forApprovers) {
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
Het betreft een co-agendering met ${additionalMandateeString}.
Kunnen de betrokken kabinetschefs hun akkoord geven via allen beantwoorden aub?
`;
  } else if (additionalMandateeNames.length === 1) {
      const additionalMandateeString = additionalMandateeNames[0];
      message += `
Het betreft een co-agendering met ${additionalMandateeString}.
Kan de betrokken kabinetschef haar/zijn akkoord geven via allen beantwoorden aub?
`;
    }
  }

  if (params.submission.confidential) {
    message += `
Het betreft een vertrouwelijke indiening.
  `;
  }

  const meetingKind = await params.meeting.kind;
  if (meetingKind?.uri === CONSTANTS.MEETING_KINDS.PVV) {
    message += `
Het betreft een indiening in het kader van het Plan Vlaamse Veerkracht.
  `;
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

  // this param does not exist yet
  if (params.hasConfidentialPieces) {
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
Aanvullende informatie voor de secretarie en kabinetschefs:
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
  let subject = 'Teruggestuurd: ';
  subject += await getSubject(params);

  let message = '';
  message += `Beste
`;
  if (params.comment) {
    message += `
Uw indiening "${params.submission.shortTitle}" werd teruggestuurd met volgende opmerking:
${params.comment}
`;
  } else {
    message += `
Uw indiening "${params.submission.shortTitle}" werd teruggestuurd.
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
  return caseSubmittedApproversEmail({ ...params, resubmitted: true });
}

async function caseUpdateSubmissionIkwEmail(params) {
  return caseSubmittedIkwEmail({ ...params, resubmitted: true });
}

async function caseUpdateSubmissionSubmitterEmail(params) {
  return caseSubmittedSubmitterEmail({ ...params, resubmitted: true });
}

export {
  caseSubmittedApproversEmail,
  caseSubmittedIkwEmail,
  caseSubmittedSubmitterEmail,
  caseSendBackEmail,
  caseResubmittedSubmitterEmail,
  caseResubmittedApproversEmail,
  caseResubmittedIkwEmail,
  caseUpdateSubmissionApproversEmail,
  caseUpdateSubmissionIkwEmail,
  caseUpdateSubmissionSubmitterEmail,
};
