import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsIndexController extends Controller {
  @service store;
  @service router;
  @service publicationService;

  @tracked publicationFlow;
  @tracked translationSubcase;

  @tracked showTranslationUploadModal = false;
  @tracked showTranslationRequestModal = false;

  get latestTranslationActivity() {
    const timelineActivity = this.model.find(
      (activity) => activity.isTranslationActivity
    );
    return timelineActivity ? timelineActivity.activity : null;
  }

  get shownActivities() {
    return this.model.filter((row) => row.isShown)
  }

  @task
  *saveTranslationUpload(translationUpload) {
    let translationActivity = this.latestTranslationActivity;

    if (!translationActivity) {
      // Uploading translated documents without a request
      const french = yield this.store.findRecordByUri(
        'language',
        CONSTANTS.LANGUAGES.FR
      );
      translationActivity = this.store.createRecord('translation-activity', {
        startDate: new Date(),
        subcase: this.translationSubcase,
        language: french,
      });
    }

    translationActivity.endDate = translationUpload.receivedDate;
    yield translationActivity.save();

    const pieceSaves = [];

    const language = yield translationActivity.language;
    for (let piece of translationUpload.pieces) {
      piece.receivedDate = translationUpload.receivedDate;
      piece.language = language;
      piece.translationActivityGeneratedBy = translationActivity;
      pieceSaves.push(piece.save());
    }

    if (translationUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED,
        translationUpload.receivedDate
      );

      this.translationSubcase.endDate = translationUpload.receivedDate;
      yield this.translationSubcase.save();
    }

    yield Promise.all([...pieceSaves]);

    this.router.refresh('publications.publication.translations.index');
    this.showTranslationUploadModal = false;
  }

  @task
  *deleteReceivedPiece(translationReceivedEvent, piece) {
    yield this.performDeleteReceivedPiece(translationReceivedEvent, piece);
  }

  async performDeleteReceivedPiece(translationReceivedEvent, piece) {
    await this.publicationService.deletePiece(piece);
    const translationActivity = translationReceivedEvent.activity;
    let pieces = await translationActivity.generatedPieces;
    pieces = pieces.slice();
    if (pieces.length === 0) {
      translationActivity.endDate = null;
      await translationActivity.save();
    }
  }

  @task
  *editTranslationActivity(translationEdit) {
    const saves = [];

    const translationActivity = translationEdit.translationActivity;
    translationActivity.endDate = translationEdit.receivedDate;
    saves.push(translationActivity.save());

    yield Promise.all(saves);
    this.router.refresh('publications.publication.translations.index');
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();

    const pieces = translationRequest.pieces;
    const dutch = yield this.store.findRecordByUri(
      'language',
      CONSTANTS.LANGUAGES.NL
    );
    yield Promise.all(
      pieces.map((piece) => {
        piece.language = dutch;
        return piece.save();
      })
    );

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: pieces,
    });
    yield requestActivity.save();

    const translationActivity = this.store.createRecord(
      'translation-activity',
      {
        startDate: now,
        dueDate: translationRequest.translationDueDate,
        title: translationRequest.subject,
        subcase: this.translationSubcase,
        requestActivity: requestActivity,
        usedPieces: pieces,
        language: yield this.store.findRecordByUri(
          'language',
          CONSTANTS.LANGUAGES.FR
        ),
      }
    );
    yield translationActivity.save();

    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    if (this.translationSubcase.hasDirtyAttributes) {
      yield this.translationSubcase.save();
    }

    const [files, outbox, mailSettings] = yield Promise.all([
      Promise.all(pieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      cc: mailSettings.translationRequestCcEmail,
      replyTo: mailSettings.translationRequestReplyToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      message: translationRequest.message,
    });
    yield mail.save();

    if (translationRequest.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED
      );
    }

    this.router.refresh('publications.publication.translations.index');
    this.showTranslationRequestModal = false;
  }

  @task
  *deleteRequest(requestActivity) {
    const translationActivity = yield requestActivity.translationActivity;
    yield translationActivity.destroyRecord();

    const mail = yield requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    yield mail?.destroyRecord();

    const pieces = yield requestActivity.usedPieces;
    for (const piece of pieces.slice()) {
      yield this.publicationService.deletePiece(piece);
    }
    yield requestActivity.destroyRecord();
    this.router.refresh('publications.publication.translations.index');
  }

  @task
  *saveProofRequest(proofRequest) {
    yield this.publicationService.createProofRequest(
      proofRequest,
      this.publicationFlow
    );

    this.router.transitionTo('publications.publication.proofs');
  }

  @action
  openTranslationUploadModal() {
    this.showTranslationUploadModal = true;
  }

  @action
  closeTranslationUploadModal() {
    this.showTranslationUploadModal = false;
  }

  @action
  openTranslationRequestModal() {
    this.showTranslationRequestModal = true;
  }

  @action
  closeTranslationRequestModal() {
    this.showTranslationRequestModal = false;
  }
}
