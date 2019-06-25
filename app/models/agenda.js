import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr("string"),
	issued: attr("date"),
	createdFor: belongsTo('meeting'),
	agendaitems: hasMany('agendaitem', { inverse: null, serialize: false }),
	created: attr('date'),
	isAccepted: attr('boolean'),
	modified: attr('date'),

	agendaName: computed('name', function () {
		if (this.get('name.length') > 2) {
			return this.name;
		} else {
			return 'Agenda ' + this.name;
		}
	}),

	isApprovable: computed('agendaitems.@each', function () {
		return this.get('agendaitems').then((agendaitems) => {
			const agendaitemsWithoutAnnouncements = agendaitems.filter((agendaitem) => !agendaitem.get('showAsRemark'));

			const approvedAgendaItems = agendaitemsWithoutAnnouncements.filter((agendaitem) => agendaitem.get('formallyOk') == CONFIG.formallyOk);
			return approvedAgendaItems.get('length') === agendaitemsWithoutAnnouncements.get('length')
		});
	}),
});
