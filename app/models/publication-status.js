import Model, { attr, hasMany } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationStatus extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;
  @hasMany('publication-flow') publications;

  get isStarted() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.STARTED;
  }

  get isPublished() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PUBLISHED;
  }

  get isWithdrawn() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN;
  }

  get isPaused() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PAUSED;
  }

  get isTranslationRequested() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED;
  }

  get isTranslationReceived() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED;
  }

  get isProofRequested() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED;
  }

  get isProofReceived() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PROOF_RECEIVED;
  }

  get isProofRecalled() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED;
  }

  get isProofCorrected() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PROOF_CORRECTED;
  }

  get isPublicationRequested() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PUBLICATION_REQUESTED;
  }

  get isPending() {
    return !(this.isPaused || this.isPublished || this.isWithdrawn);
  }

  get isFinal() {
    return this.isPublished || this.isWithdrawn;
  }
}
