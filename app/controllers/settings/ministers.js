import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { task } from 'ember-concurrency';
import {isPresent} from '@ember/utils';
export default Controller.extend(isAuthenticatedMixin, {

	reAssignPriorities: task(function* (agendaitemGroup) {
		yield agendaitemGroup.map((item) => {
			if (isPresent(item.changedAttributes().priority)) {
				return item.save();
			}
		});
	}).restartable(),

	actions: {
			async reorderItems(model, reOrderedModel, itemDragged) {
			if(this.isEditor || this.isAdmin) {
				const firstPrio = 1;
				const newIndex = reOrderedModel.indexOf(itemDragged)

				for (let i = 0; i < reOrderedModel.get('length'); i++) {
					const reOrderedAgendaitem = reOrderedModel.objectAt(i);
					const agendaitem = model.find((item) => item.id === reOrderedAgendaitem.get('id'));
					const newPrio = (i + firstPrio);
					const draggedPrio = (newIndex + firstPrio);
					const agendaitemPrio = agendaitem.get('priority');
					if (newPrio != draggedPrio) {
						if (agendaitemPrio != newPrio) {
							agendaitem.set('priority', newPrio);
						}
					} else {
						if (agendaitemPrio != draggedPrio) {
							agendaitem.set('priority', draggedPrio);
						}
					}
				}
				this.reAssignPriorities.perform(model);
				this.set('model', model.sortBy('priority'));
			}
	}
	}
});
