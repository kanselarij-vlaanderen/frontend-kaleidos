export function getPublicationStatusPillKey(publicationStatus) {
  if (publicationStatus.isPaused) {
    return 'paused';
  } else if (publicationStatus.isPublished) {
    return 'success';
  } else if (publicationStatus.isWithdrawn) {
    return 'error';
  } else {
    return 'in-progress';
  }
}

export function getPublicationStatusPillStep(publicationStatus) {
  if (publicationStatus.isPending) {
    return publicationStatus.position - 1;
  } else {
    return null;
  }
}
