import Service, { inject } from '@ember/service';
import { computed } from '@ember/object';

import { PromiseArray } from '@ember-data/store/-private';
import { all } from 'rsvp';

// TODO: octane-refactor or refactor to stateless service (but not methods so empty service?)
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  /*
    Stored states:
    currentSession (actually currentMeeting)
    currentAgenda
  */
  store: inject(),
  router: inject(),
  currentSession: null,

  // TODO KAS-2399 check if this is still used after agenda-header refactor
  agendas: computed('currentSession.agendas.[]', function() {
    if (!this.get('currentSession')) {
      return [];
    }
    return PromiseArray.create({
      promise: this.get('currentSession.agendas').then(async(agendas) => {
        await all(agendas.map((agenda) => agenda.load('status')));
        return agendas.sortBy('serialnumber').reverse();
      }),
    });
  }),
});
