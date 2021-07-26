import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { action } from '@ember/object';

export default class CaseSubcasesOverviewRoute extends Route {
  async model() {
    const caze = this.modelFor('cases.case');
    const subcases = await this.store.query('subcase', {
      filter: {
        case: {
          id: caze.get('id'),
        },
      },
      sort: '-created',
    });

    return hash({
      subcases,
      case: caze,
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
