import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import DS from 'ember-data';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-panel-layout__main-content"],
	currentAgenda: alias('sessionService.currentAgenda'),
	sessionService: inject(),
	store: inject(),
	activeAgendaItemSection: 'details',

	checkAgendaItemSubcase: observer('subcase', function () {
    this.get('subcase').then((subcase) => {
      let currentSelection = this.activeAgendaItemSection;
      if(!subcase && ['details', 'documenten', 'comments'].indexOf(currentSelection) < 0){
        this.set('activeAgendaItemSection', 'details');
      }
    });
	}),

	subcase: computed('agendaitem.subcase', function () {
		return DS.PromiseObject.create({
			promise: this.get('agendaitem.subcase').then((subcase) => {
				return subcase;
			})
		})
	}),

	lastDefiniteAgenda: computed('sessionService.definiteAgendas.@each', function () {
		return DS.PromiseObject.create({
			promise: this.get('sessionService.definiteAgendas').then((definiteAgendas) => {
				return definiteAgendas.get('lastObject');
			})
		})
	}),

	actions: {
		async addDecision() {
			const subcase = await this.get('subcase');
			if(subcase) {
				const newDecision = this.store.createRecord('decision', {
					approved: false, subcase
				})
				await newDecision.save();
				await subcase.get('decisions').addObject(newDecision);
			}
		},

		setAgendaItemSection(section) {
			this.set("activeAgendaItemSection", section);
		},

		refreshRoute(id) {
			this.refreshRoute(id);
		}
	}
});
