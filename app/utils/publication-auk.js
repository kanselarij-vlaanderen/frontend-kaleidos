// TODO: updated new designs with steps
export function getPublicationStatusPillKey(publicationStatus) {
  if (publicationStatus.isPaused) {
    return 'paused';
  } else if (publicationStatus.isPublished) {
    return 'done';
  } else if (publicationStatus.isWithdrawn) {
    return 'error';
  } else {
    return 'in-progress';
  }
}
