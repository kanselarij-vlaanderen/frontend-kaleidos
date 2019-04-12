import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null,

  actions: {
    toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
		},
  }
});
