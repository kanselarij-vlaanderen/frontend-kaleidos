import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export class Activity {
  @tracked requestActivity;
  @tracked translationActivity;
  @tracked date;

  static create(requestActivity,translationActivity) {
    const activity = new Activity();
    if (requestActivity){
      activity.requestActivity = requestActivity;
      activity.date = requestActivity.startDate;
    }
    if (translationActivity){
      activity.translationActivity = translationActivity;
      activity.date = translationActivity.endDate
    }
    return activity;
  }
}

export default class PublicationsPublicationTranslationsRoute extends Route {
  async model() {
    this.translationSubcase = await this.modelFor('publications.publication.translations');

    let requestActivities = await this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'email,used-pieces,used-pieces.file',
        sort: '-start-date',
      }
    );

    let translationActivities = await this.store.query('translation-activity',
      {
        'filter[subcase][:id:]': this.translationSubcase.id,
        include: 'generated-pieces,generated-pieces.file',
        sort: '-start-date',
      }
    );

    let activities = await Promise.all([ requestActivities.map((request) => Activity.create(request,null)) , translationActivities.map((translation) => Activity.create(null,translation))]);
    activities = activities.flatMap((activity) => activity.toArray());
    activities = activities.sortBy('date').reverseObjects();
    return activities;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = await this.publicationFlow.publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationSubcase = this.translationSubcase;
    controller.publicationSubcase = this.publicationSubcase;
  }

  @action
  refresh() {
    super.refresh();
  }
}
