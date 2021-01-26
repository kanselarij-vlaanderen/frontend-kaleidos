import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const {
  Model,
  attr,
  belongsTo,
  hasMany,
} = DS;

export default Model.extend(LoadableModel, {
  name: computed.alias('serialnumber'),
  title: attr('string'),
  serialnumber: attr('string'),
  issued: attr('datetime'),
  createdFor: belongsTo('meeting'),
  status: belongsTo('agendastatus', {
    inverse: null,
  }),
  agendaitems: hasMany('agendaitem', {
    inverse: null,
    serialize: false,
  }),
  created: attr('datetime'),
  modified: attr('datetime'),

  isDesignAgenda: computed('status.isDesignAgenda', function() {
    return this.get('status.isDesignAgenda');
  }),

  isApproved: computed('status.isApproved', function() {
    return this.get('status.isApproved');
  }),

  async asyncCheckIfDesignAgenda() {
    await this.get('status');

    return this.get('isDesignAgenda');
  },

  agendaName: computed('serialnumber', 'status', function() {
    const isDesignAgenda = this.get('status.isDesignAgenda');
    const agendaName = this.serialnumber || '';
    let prefix;
    if (isDesignAgenda) {
      prefix = 'Ontwerpagenda';
    } else {
      prefix = 'Agenda';
    }
    return `${prefix} ${agendaName}`;
  }),

  isFinal: computed.alias('status.isFinal'),

  /**
   * KAS-2194, can you approve and agenda with formal NOT ok ? Would assume that we have to rollback the agendaitem to a previous version in that case
   */
  isApprovable: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaitems = agendaitems.filter((agendaitem) => [CONFIG.formallyOk, CONFIG.formallyNok].includes(agendaitem.get('formallyOk')));
      return approvedAgendaitems.get('length') === agendaitems.get('length');
    });
  }),

  isClosable: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaitems = agendaitems.filter((agendaitem) => [CONFIG.formallyOk].includes(agendaitem.get('formallyOk')));
      return approvedAgendaitems.get('length') === agendaitems.get('length');
    });
  }),

  isPassable: computed('agendaitems.@each', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaitems = agendaitems.filter((agendaitem) => this.checkPassable(agendaitem));
      return approvedAgendaitems.get('length') === agendaitems.get('length');
    });
  }),

  lastAgendaitemPriority: computed('agendaitems.@each', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const filteredAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
      if (filteredAgendaitems.length === 0) {
        return 0;
      }
      return Math.max(...filteredAgendaitems.map((agendaitem) => agendaitem.priority || 0));
    });
  }),

  lastAnnouncementPriority: computed('agendaitems.@each', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);
      if (announcements.length === 0) {
        return 0;
      }
      return Math.max(...announcements.map((announcement) => announcement.priority || 0));
    });
  }),

  checkPassable(agendaitem) {
    return (
      agendaitem.get('isAdded')
      || [CONFIG.formallyOk, CONFIG.formallyNok].includes(agendaitem.get('formallyOk'))
    );
  },

  firstAgendaitem: computed('agendaitems.@each', function() {
    return DS.PromiseObject.create({
      promise: this.get('agendaitems').then((agendaitems) => agendaitems.sortBy('priority').get('firstObject')),
    });
  }),

  // KAS-2194 new stuff

  agendaitemsFormallyNotOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const agendaitemsFormallyNotOk = agendaitems.filter((agendaitem) => [CONFIG.formallyNok].includes(agendaitem.get('formallyOk')));
      return agendaitemsFormallyNotOk;
    });
  }),

  hasAgendaitemsFormallyNotOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitemsFormallyNotOk').length > 0;
  }),

  agendaitemsFormallyNotYetOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const agendaitemsFormallyNotYetOk = agendaitems.filter((agendaitem) => [CONFIG.notYetFormallyOk].includes(agendaitem.get('formallyOk')));
      return agendaitemsFormallyNotYetOk;
    });
  }),

  hasAgendaitemsFormallyNotYetOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitemsFormallyNotYetOk').length > 0;
  }),

  canBeApproved: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaitems = agendaitems.filter((agendaitem) => [CONFIG.formallyOk].includes(agendaitem.get('formallyOk')));
      return approvedAgendaitems.get('length') === agendaitems.get('length');
    });
  }),

  agendaitemsNotOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const agendaitemsNotOk = agendaitems.filter((agendaitem) => [CONFIG.formallyNok, CONFIG.notYetFormallyOk].includes(agendaitem.get('formallyOk')));
      return agendaitemsNotOk.sortBy('number');
    });
  }),

});
