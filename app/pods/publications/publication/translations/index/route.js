import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export class TimeLineActivity {
  @tracked activity;
  @tracked date;

  constructor(activity, date) {
    this.activity = activity;
    this.date = date;
  }

  get isRequestActivity() {
    return this.activity.constructor.modelName === 'request-activity';
  }

  get isTranslationActivity() {
    return this.activity.constructor.modelName === 'translation-activity';
  }

  get date() {
    return this.date;
  }
}

export default class PublicationsPublicationTranslationsIndexRoute extends Route {
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
        include: 'generated-pieces,generated-pieces.file',
        sort: '-start-date',
      }
    );

    let activities = await Promise.all([
      requestActivities.map(
        (request) => new TimeLineActivity(request, request.startDate)
      ),
      translationActivities.map(
        (translation) => new TimeLineActivity(translation, translation.endDate)
      ),
    ]);
    activities = activities.flatMap((activity) => activity.toArray());
    activities = activities.sortBy('date').reverseObjects();
    return activities;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationSubcase = this.translationSubcase;
  }

  @action
  refresh() {
    super.refresh();
  }
}
