import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  sessionService: inject(),
  currentAgenda: alias('sessionService.currentAgenda'),
  currentSession: alias('sessionService.currentSession'),

  actions: {
    refresh(id) {
      const { currentAgenda, currentSession } = this;
      this.transitionToRoute('agenda.agendaitems.index', currentSession.id, currentAgenda.id, {
        queryParams: {
          refresh: id
        },
      });
    },
  }
});
