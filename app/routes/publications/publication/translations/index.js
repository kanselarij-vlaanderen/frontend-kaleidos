import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';

export class TimelineActivity {
  static async create(activity) {
    const row = new TimelineActivity();
    row.activity = activity;

    if (row.isTranslationActivity) {
      let pieces = await Promise.all([
        row.activity.usedPieces,
        row.activity.generatedPieces,
      ]);
      pieces = pieces.map((pieces) => pieces.slice());
      pieces = pieces.flat();
      let proofingActivities = pieces.map((a) => a.proofingActivitiesUsedBy);
      proofingActivities = await Promise.all(proofingActivities);
      proofingActivities = proofingActivities.map((proofingActivities) => proofingActivities.slice());
      proofingActivities = proofingActivities.flat();
      row.canDeletePieces = proofingActivities.length === 0;
    }

    return row;
  }

  @tracked activity;
  @tracked canDeletePieces;

  get isRequestActivity() {
    return this.activity.constructor.modelName === 'request-activity';
  }

  get isTranslationActivity() {
    return this.activity.constructor.modelName === 'translation-activity';
  }

  get date() {
    if (this.isRequestActivity) {
      return this.activity.startDate;
    } else if (this.isTranslationActivity) {
      return this.activity.startDate;
    } else {
      warn(`Getting date for unsupported activity type ${this.activity.constructor.modelName}`);
      return null;
    }
  }

  get isShown() {
    if (this.isTranslationActivity) {
      // A translation activity without end-date is created together with request-activity,
      // but should not be shown yet.
      return this.activity.isFinished;
    } else {
      return true;
    }
  }
}

export default class PublicationsPublicationTranslationsIndexRoute extends Route {
  @service store;

  async model() {
    this.translationSubcase = this.modelFor(
      'publications.publication.translations'
    );

    const requestActivities = await this.store.query('request-activity', {
      'filter[translation-subcase][:id:]': this.translationSubcase.id,
      include: 'email,used-pieces,used-pieces.file',
      sort: '-start-date',
    });

    const translationActivities = await this.store.query(
      'translation-activity',
      {
        'filter[subcase][:id:]': this.translationSubcase.id,
        include: [
          'used-pieces',
          'used-pieces.proofing-activities-used-by',
          'generated-pieces',
          'generated-pieces.file',
          'generated-pieces.proofing-activities-used-by',
        ].join(','),
        sort: '-start-date',
      }
    );

    let rows = await Promise.all([
      ...requestActivities.map((request) => TimelineActivity.create(request)),
      ...translationActivities.map((translation) => TimelineActivity.create(translation)),
    ]);
    rows = rows.sort((r1, r2) => r1.date - r2.date).reverse();
    return rows;
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationSubcase = this.translationSubcase;
  }
}
