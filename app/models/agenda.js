import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  name: attr('string'),
  issued: attr('datetime'),
  createdFor: belongsTo('meeting'),
  agendaitems: hasMany('agendaitem', { inverse: null, serialize: false }),
  created: attr('date'),
  isAccepted: attr('boolean'),
  modified: attr('datetime'),

  isDesignAgenda: computed('name', function () {
    return this.name === 'Ontwerpagenda';
  }),

  agendaName: computed('name', function () {
    if (this.get('name.length') > 2) {
      return this.name;
    } else {
      return 'Agenda ' + this.name;
    }
  }),

  isApprovable: computed('agendaitems.@each', function () {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaItems = agendaitems.filter((agendaitem) =>
        this.checkFormallyOkStatus(agendaitem)
      );
      return approvedAgendaItems.get('length') === agendaitems.get('length');
    });
  }),

  isPassable: computed('agendaitems.@each', function () {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaItems = agendaitems.filter((agendaitem) =>
        this.checkPassable(agendaitem)
      );
      return approvedAgendaItems.get('length') === agendaitems.get('length');
    });
  }),

  lastAgendaitemPriority: computed('agendaitems.@each', function () {
    return this.get('agendaitems').then((agendaitems) => {
      const filteredAgendaitems = agendaitems.filter((item) => !item.showAsRemark);
      if (filteredAgendaitems.length == 0) {
        return 0;
      }
      return Math.max(...filteredAgendaitems.map((item) => item.priority || 0));
    });
  }),

  lastAnnouncementPriority: computed('agendaitems.@each', function () {
    return this.get('agendaitems').then((agendaitems) => {
      const announcements = agendaitems.filter((item) => item.showAsRemark);
      if (announcements.length == 0) {
        return 0;
      }
      return Math.max(...announcements.map((item) => item.priority || 0));
    });
  }),

  checkFormallyOkStatus(agendaitem) {
    return [CONFIG.formallyOk, CONFIG.formallyNok].includes(agendaitem.get('formallyOk'));
  },

  checkPassable(agendaitem) {
    return (
      agendaitem.get('isAdded') ||
      [CONFIG.formallyOk, CONFIG.formallyNok].includes(agendaitem.get('formallyOk'))
    );
  },

  firstAgendaItem: computed('agendaitems.@each', function () {
    return DS.PromiseObject.create({
      promise: this.get('agendaitems').then((agendaitems) => {
        return agendaitems.sortBy('priority').get('firstObject');
      }),
    });
  }),
});
