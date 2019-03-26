import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const caze = this.modelFor('cases.case');
    return hash({
      subcases: this.store.query('subcase', {
        filter: {
          case: { id: caze.get('id') },
          // sort: 'created'
        },
        include: "case.type,phases"
      }),
      case: caze
    });
  }
});
