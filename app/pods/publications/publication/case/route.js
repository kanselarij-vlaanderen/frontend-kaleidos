import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class CaseRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const publicationFlow = this.modelFor('publications.publication');
    const _case = await publicationFlow.get('case');
    return _case;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const publicationFlow = this.modelFor('publications.publication');
    const contactPersons = await publicationFlow.get('contactPersons');
    const subcasesOnMeeting = await this.store.query('subcase', {
      filter: {
        case: {
          id: model.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });
    if (subcasesOnMeeting) {
      controller.set('latestSubcaseOnMeeting', subcasesOnMeeting.get('firstObject'));
    }
    controller.set('contactPersons', contactPersons);
    controller.set('publicationFlow', publicationFlow);
  }
}
