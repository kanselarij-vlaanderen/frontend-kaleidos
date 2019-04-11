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
	agendas: hasMany('agenda', {inverse:null}),
	requestedSubcases: hasMany('subcase'),
	postponeds: hasMany('postponed'),
	notes: belongsTo('meeting-record'),
	newsletter: belongsTo('newsletter-info'),
  isFinal: attr("boolean"),
	latestAgendaName: computed('agendas', function() {
		return this.get('agendas').then((agendas) => {
			const agendaNamePosition = agendas.length - 1;
			if(agendaNamePosition >= 0) {
				if(alphabet[agendaNamePosition]) {
					return "Ontwerpagenda " + alphabet[agendaNamePosition];
				} else {
					return "Ontwerpagenda " + agendaNamePosition
				}
			} else {
				return "Geen versie beschikbaar";
			}
		})
	}),
});
