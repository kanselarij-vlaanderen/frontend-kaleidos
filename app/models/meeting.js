import DS from 'ember-data';
import { computed } from '@ember/object';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

let { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	plannedStart: attr("date"),
	startedOn: attr("date"),
	endedOn: attr('date'),
	location: attr('string'),
	number: attr('number'),
	isFinal: attr("boolean"),

	agendas: hasMany('agenda', { inverse: null, serialize: false }),
	requestedSubcases: hasMany('subcase'),
	postponeds: hasMany('postponed'),
	relatedCases: hasMany('case'),

	notes: belongsTo('meeting-record'),
	newsletter: belongsTo('newsletter-info'),
	signature: belongsTo('signature'),

	latestAgenda: computed('agendas.@each', function () {
		return DS.PromiseObject.create({
			promise: this.get('agendas').then((agendas) => {
				const sortedAgendas = agendas.sortBy('agendaName').reverse();
				return sortedAgendas.get('firstObject');
			})
		})
	}),

	latestAgendaName: computed('latestAgenda', 'agendas', function () {
		return this.get('latestAgenda').then((agenda) => {
			const agendaLength = this.get('agendas.length');
			const agendaName = agenda.name;
			if (agendaName !== "Ontwerpagenda") {
				return `Agenda ${agendaName}`;
			} else {
				return `${agendaName} ${alphabet[agendaLength - 1]}`;
			}
		})
	}),
});
