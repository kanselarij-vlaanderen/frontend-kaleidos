import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export class TimeLineActivity {
  @tracked requestActivity;
  @tracked translationActivity;
  @tracked date;

  constructor(requestActivity, translationActivity) {
    if (requestActivity) {
      this.requestActivity = requestActivity;
      this.date = requestActivity.startDate;
    }
    if (translationActivity) {
      this.translationActivity = translationActivity;
      this.date = translationActivity.endDate;
    }
  }
}

export default class PublicationsPublicationTranslationsIndexRoute extends Route {
  async model() {
    this.translationSubcase = this.modelFor(
      'publications.publication.translations'
    );

    let requestActivities = await this.store.query('request-activity', {
      'filter[translation-subcase][:id:]': this.translationSubcase.id,
      include: 'email,used-pieces,used-pieces.file',
      sort: '-start-date',
    });

    let translationActivities = await this.store.query('translation-activity', {
      'filter[subcase][:id:]': this.translationSubcase.id,
      include: 'generated-pieces,generated-pieces.file',
      sort: '-start-date',
    });

    let activities = await Promise.all([
      requestActivities.map((request) => new TimeLineActivity(request, null)),
      translationActivities.map((translation) =>
        new TimeLineActivity(null, translation)
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
