import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { action } from '@ember/object';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers',
      reload: true,
    });
    await publicationFlow.get('regulationType');
    const _case = await publicationFlow.get('case');
    const identification = await publicationFlow.get('identification');

    const subcasesOnMeeting = await this.store.query('subcase', {
      filter: {
        case: {
          id: _case.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });

    return hash({
      publicationFlow,
      latestSubcaseOnMeeting: subcasesOnMeeting.get('firstObject'),
      case: _case,
      identification: identification,
      refreshAction: this.refreshModel,
    });
  }

  async afterModel() {
    await this.store.query('publication-status', {});
    await this.store.query('regulation-type', {});
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.publicationNotAfterTranslationForPublication = false;
    controller.publicationNotAfterTranslationForTranslation = false;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
