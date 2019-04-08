import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias, filter } from '@ember/object/computed';
import { computed } from '@ember/object';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	classNames: ["vlc-page-header"],

	isShowingOptions: false,
	isPrintingNotes: false,
	isAddingAgendaitems: false,

	currentAgendaItems: alias('sessionService.currentAgendaItems'),
	currentSession: alias('sessionService.currentSession'),
	currentAgenda: alias('sessionService.currentAgenda'),
	agendas: alias('sessionService.agendas'),
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	definiteAgendas: alias('sessionService.definiteAgendas'),

	designAgendaPresent: filter('currentSession.agendas.@each.name', function (agenda) {
		return agenda.get('name') === "Ontwerpagenda";
	}),

	async createDesignAgenda() {
		this.changeLoading();
		const session = this.get('currentSession');
		const definiteAgendas = await this.get('definiteAgendas');
		const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

		this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, lastDefiniteAgenda).then(newAgenda => {
			this.changeLoading();
			this.set('sessionService.currentAgenda', newAgenda)
			this.reloadRoute(newAgenda.get('id'));
		});
	},

	actions: {
		navigateToNotes() {
			const { currentSession, currentAgenda } = this;
			this.navigateToNotes(currentSession.get('id'), currentAgenda.get('id'));
		},
		clearSelectedAgendaItem() {
			this.clearSelectedAgendaItem();
		},

		async approveAgenda(session) {
			this.changeLoading();
			let agendas = await this.get('agendas');
			let agendaToLock = await agendas.find(agenda => agenda.name == "Ontwerpagenda");
			let definiteAgendas = await this.get('definiteAgendas');
			let lastDefiniteAgenda = await definiteAgendas.get('firstObject');

			if (!lastDefiniteAgenda) {
				agendaToLock.set('name', alphabet[0]);
			} else {
				if (definiteAgendas) {
					const agendaLength = definiteAgendas.length;
					if (agendaLength && alphabet[agendaLength]) {
						if (agendaLength < alphabet.length - 1) {
							agendaToLock.set('name', alphabet[agendaLength]);
						}
					} else {
						agendaToLock.set('name', agendaLength + 1);
					}
				} else {
					agendaToLock.set('name', agendas.get('length') + 1);
				}
			}

			agendaToLock.set('isAccepted', true);
			agendaToLock.save().then(() => {
				this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, agendaToLock).then(newAgenda => {
					this.changeLoading();
					this.set('sessionService.currentAgenda', newAgenda)
					this.reloadRoute(newAgenda.get('id'));
				});
			})
		},

		async lockAgenda(agenda) {
			const agendas = await this.get('agendas');
			const definiteAgenda = agendas.filter(agenda => agenda.name != "Ontwerpagenda").sortBy('-name').get('lastObject');
			definiteAgenda.set('isFinal', true);
			definiteAgenda.save().then(newAgenda => {
				agenda.destroyRecord().then(() => {
					this.reloadRoute(newAgenda.get('id'));
				});
			});
		},

		async unlockAgenda() {
			await this.createDesignAgenda();
		},

		showMultipleOptions() {
			this.toggleProperty('isShowingOptions');
		},

		toggleIsPrintingNotes() {
			this.toggleProperty('isPrintingNotes');
		},

		compareAgendas() {
			this.compareAgendas();
		},

		navigateToSubCases() {
			this.set('isAddingAgendaitems', true);
		},

		printDecisions() {
			this.printDecisions();
		},

		navigateToCreateAnnouncement() {
			this.set('addingAnnouncement', true);
			this.navigateToCreateAnnouncement();
		},

		async deleteDesignAgenda(agenda) {
			const definiteAgendas = await this.get('definiteAgendas');
			const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

			agenda.destroyRecord().then(() => {
				this.set('sessionService.currentAgenda', lastDefiniteAgenda || null)
			});
		},

		async createNewDesignAgenda() {
			await this.createDesignAgenda();
		},

		async createPressAgenda() {
			const currentAgendaitems = await this.get('currentAgendaItems');
			const pressItems = await Promise.all(currentAgendaitems.map(async item => {
				const mandatees = await this.store.peekRecord('agendaitem', item.id).get('subcase').get('mandatees');
				if (item.forPress) {
					return { id: item.id, title: item.titlePress, content: item.textPress, mandatees: mandatees }
				}
			}));
			const prioritisedItems = await this.reduceGroups(pressItems);

			this.set('pressItems', prioritisedItems);
			this.set('showPressModal', true);
		},

		closePressAgenda() {
			this.set('showPressModal', false);
		},

		reloadRoute(id) {
			this.reloadRoute(id);
		}
	},

	async reduceGroups(pressItems) {
		const { currentAgenda, agendaService } = this;
		const sortedAgendaItems = await agendaService.getSortedAgendaItems(currentAgenda);
		const pressAgendaItems = pressItems.filter(pressItem => {
			if (pressItem && pressItem.id) {
				let foundItem = sortedAgendaItems.find(item => item.uuid === pressItem.id);
				if (foundItem) {
					pressItem.priority = foundItem.priority;
					pressItem.mandatePriority = foundItem.mandatePriority;
					return pressItem;
				}
			}
		});

		return pressAgendaItems.reduce((items, agendaitem) => {
			const mandatees = agendaitem.mandatees.map(item => item.title);
			items[agendaitem.mandatePriority] = items[agendaitem.mandatePriority] || { mandatees: mandatees, agendaitems: [] };
			items[agendaitem.mandatePriority].agendaitems.push(agendaitem);
			return items;
		}, []);
	},

	changeLoading() {
		this.loading();
	},

	reloadRoute(id) {
		this.reloadRouteWithNewAgenda(id);
	}
});
