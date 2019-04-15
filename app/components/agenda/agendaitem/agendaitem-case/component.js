import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null,

  isAgendaItem: computed('item', function () {
		const { item } = this;
		const modelName = item.get('constructor.modelName')
		return modelName === 'agendaitem';
	}),

  item: computed('agendaitem', 'subcase', function() {
    const { agendaitem, subcase} = this;
    if(agendaitem) {
      return agendaitem;
    } else {
      return subcase;
    } 
  }),

  actions: {
    toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
		},
  }
});
