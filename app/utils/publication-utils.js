import moment from 'moment';

export async function getIsClosed(publicationFlow) {
  let publicationStatus = await publicationFlow.status;
  return publicationStatus.isPublished || publicationStatus.isWithdrawn;
}

export async function getIsTranslationToLate(publicationFlow) {
  let isClosed = await getIsClosed(publicationFlow);
  if (isClosed) {
    return false;
  }

  let translationSubcase = await publicationFlow.translationSubcase;
  let translationDueDate = translationSubcase.dueDate;
  let isToLate = moment(translationDueDate).isBefore(Date.now(), 'day')
  return isToLate;
}

export async function getIsPublicationToLate(publicationFlow) {
  let isClosed = await getIsClosed(publicationFlow);
  if (isClosed) {
    return false;
  }

  let publicationSubcase = await publicationFlow.publicationSubcase;
  let publicationDueDate = publicationSubcase.dueDate;
  let isToLate = moment(publicationDueDate).isBefore(Date.now(), 'day')
  return isToLate;
}
