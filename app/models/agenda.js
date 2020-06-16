import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend(LoadableModel, {
  name: computed.alias('serialnumber'),
  title: attr('string'),
  agendatype: attr('string'),
  serialnumber: attr('string'),
  issued: attr('datetime'),
  createdFor: belongsTo('meeting'),
  status: belongsTo('agendastatus', {inverse: null}),
  agendaitems: hasMany('agendaitem', { inverse: null, serialize: false }),
  created: attr('date'),
  modified: attr('datetime'),

  isDesignAgenda: computed('status.isDesignAgenda', function () {
    return this.get('status.isDesignAgenda');
  }),

  async asyncCheckIfDesignAgenda(){
    await this.get('status');

    return this.get('isDesignAgenda');
  },

  agendaName: computed('serialnumber', 'status', function () {
    const isDesignAgenda = this.get('status.isDesignAgenda');
    let prefix = "Agenda ";
    if(isDesignAgenda){
      prefix = 'Ontwerpagenda ';
    }
    return `${prefix} ${this.serialnumber}`;
  }),

  isFinal: computed.alias('status.isFinal'),

  isApprovable: computed('agendaitems.@each.formallyOk', function () {
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
