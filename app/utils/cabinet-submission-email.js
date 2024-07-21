// * NOTES *
// 1. single new line: '\t\n' (multiple just n x '\n')
// => prevent Outlook from removing extra line breaks with just '\n'
// @see {@link https://docs.microsoft.com/en-us/outlook/troubleshoot/message-body/line-breaks-are-removed-in-posts-made-in-plain-text}
// "By default, the Auto Remove Line Breaks feature in Outlook is enabled.
// This causes the line breaks to be removed. Any two or more successive
// line breaks are not removed.""
// 2. no mulitline string:
// => ensure exact representation

const footer = '';

function caseSubmittedEmail(params) {
  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Er is een nieuwe indiening "${params.submissionTitle}" in het dossier "${params.caseName}"\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}`;

  return message;
}

function caseSubmittedApproversEmail(params) {
  const subject = `Nieuwe indiening in dossier "${params.caseName}"`;

  let message = caseSubmittedEmail(params);
  if (params.approvalComment) {
    message +=
      `\t\n` + `Aanvullende informatie: "${params.approvalComment}"\t\n`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseSubmittedIkwEmail(params) {
  const subject = `Nieuwe indiening in dossier "${params.caseName}"`;

  let message = caseSubmittedEmail(params);

  if (params.notificationComment) {
    message += `\t\n` + `Aanvullende informatie: "${params.notificationComment}"\t\n`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseSubmittedSubmitterEmail(params) {
  const subject = `Nieuwe indiening in dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Uw nieuwe indiening "${params.submissionTitle}" in het dossier: ${params.caseName}, is goed ontvangen.\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;
  if (params.approvalComment) {
    message += `Aanvullende informatie voor goedkeuring: ${params.approvalComment}\t\n`;
  }
  if (params.notificationComment) {
    message += `\t\nAanvullende informatie voor IKW-groep: ${params.notificationComment}\t\n`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseSendBackEmail(params) {
  const subject = `Indiening voor het dossier ${params.caseName} werd teruggestuurd.`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Uw indiening "${params.submissionTitle}" in het dossier: ${params.caseName}, werd teruggestuurd."\t\n` +
    `U kunt de indiening hier bekijken: ${params.submissionUrl}`;

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseResubmittedSubmitterEmail(params) {
  const subject = `Herindiening in het dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Uw herindiening "${params.submissionTitle}" in het dossier "${params.caseName}" is goed ontvangen.\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseResubmittedEmail(params) {
  const subject = `Herindiening in het dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Er is een herindiening "${params.submissionTitle}" in het dossier "${params.caseName}".\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseUpdateSubmissionApproversEmail(params) {
  // TODO: fix message content
  const subject = `Herindiening in het dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Er is een herindiening "${params.submissionTitle}" in het dossier "${params.caseName}".\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;
  if (params.approvalComment) {
    message += `Aanvullende informatie voor goedkeuring: ${params.approvalComment}\t\n`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseUpdateSubmissionIkwEmail(params) {
  // TODO: fix message content
  const subject = `Herindiening in het dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Er is een herindiening "${params.submissionTitle}" in het dossier "${params.caseName}".\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;

  if (params.notificationComment) {
    message += `\t\nAanvullende informatie voor IKW-groep: ${params.notificationComment}\t\n`;
  }

  return {
    subject,
    message: [message, footer].join('\n\n'),
  };
}

function caseUpdateSubmissionSubmitterEmail(params) {
  // TODO: fix message content
  const subject = `Herindiening in het dossier "${params.caseName}"`;

  let message = '';
  message +=
    'Beste,\n' +
    '\n' +
    `Uw herindiening "${params.submissionTitle}" in het dossier "${params.caseName}" werd goed ontvangen.\n` +
    `U kunt deze hier bekijken: ${params.submissionUrl}\t\n`;
  if (params.approvalComment) {
    message += `Aanvullende informatie voor goedkeuring: ${params.approvalComment}\t\n`;
  }
  if (params.notificationComment) {
    message += `\t\nAanvullende informatie voor IKW-groep: ${params.notificationComment}\t\n`;
  }

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
  caseResubmittedSubmitterEmail,
  caseResubmittedEmail,
  caseUpdateSubmissionApproversEmail,
  caseUpdateSubmissionIkwEmail,
  caseUpdateSubmissionSubmitterEmail,
};
