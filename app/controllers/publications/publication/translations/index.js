import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
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

  saveTranslationUpload = task(async (translationUpload) => {
    let translationActivity = this.latestTranslationActivity;

    if (!translationActivity) {
      // Uploading translated documents without a request
      const french = await this.store.findRecordByUri(
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
    await translationActivity.save();

    const pieceSaves = [];

    const language = await translationActivity.language;
    for (let piece of translationUpload.pieces) {
      piece.receivedDate = translationUpload.receivedDate;
      piece.language = language;
      piece.translationActivityGeneratedBy = translationActivity;
      pieceSaves.push(piece.save());
    }

    if (translationUpload.mustUpdatePublicationStatus) {
      await this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED,
        translationUpload.receivedDate
      );

      this.translationSubcase.endDate = translationUpload.receivedDate;
      await this.translationSubcase.save();
    }

    await Promise.all([...pieceSaves]);

    this.router.refresh('publications.publication.translations.index');
    this.showTranslationUploadModal = false;
  });

  deleteReceivedPiece = task(async (translationReceivedEvent, piece) => {
    await this.performDeleteReceivedPiece(translationReceivedEvent, piece);
  });

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

  editTranslationActivity = task(async (translationEdit) => {
    const saves = [];

    const translationActivity = translationEdit.translationActivity;
    translationActivity.endDate = translationEdit.receivedDate;
    saves.push(translationActivity.save());

    await Promise.all(saves);
    this.router.refresh('publications.publication.translations.index');
  });

  saveTranslationRequest = task(async (translationRequest) => {
    const now = new Date();

    const pieces = translationRequest.pieces;
    const dutch = await this.store.findRecordByUri(
      'language',
      CONSTANTS.LANGUAGES.NL
    );
    await Promise.all(
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
    await requestActivity.save();

    const translationActivity = this.store.createRecord(
      'translation-activity',
      {
        startDate: now,
        dueDate: translationRequest.translationDueDate,
        title: translationRequest.subject,
        subcase: this.translationSubcase,
        requestActivity: requestActivity,
        usedPieces: pieces,
        language: await this.store.findRecordByUri(
          'language',
          CONSTANTS.LANGUAGES.FR
        ),
      }
    );
    await translationActivity.save();

    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    if (this.translationSubcase.hasDirtyAttributes) {
      await this.translationSubcase.save();
    }

    const [files, outbox, mailSettings] = await Promise.all([
      Promise.all(pieces.map((p) => p.file)),
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
    await mail.save();

    if (translationRequest.mustUpdatePublicationStatus) {
      await this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED
      );
    }

    this.router.refresh('publications.publication.translations.index');
    this.showTranslationRequestModal = false;
  });

  deleteRequest = task(async (requestActivity) => {
    const translationActivity = await requestActivity.translationActivity;
    await translationActivity.destroyRecord();

    const mail = await requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    await mail?.destroyRecord();

    const pieces = await requestActivity.usedPieces;
    for (const piece of pieces.slice()) {
      await this.publicationService.deletePiece(piece);
    }
    await requestActivity.destroyRecord();
    this.router.refresh('publications.publication.translations.index');
  });

  saveProofRequest = task(async (proofRequest) => {
    await this.publicationService.createProofRequest(
      proofRequest,
      this.publicationFlow
    );

    this.router.transitionTo('publications.publication.proofs');
  });

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
