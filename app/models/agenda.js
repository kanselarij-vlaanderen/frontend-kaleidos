import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
// LoadableModel is still depended upon here and there. Should refactor out in the more general direction the codebase handles these load operations.
// eslint-disable-next-line ember/no-mixins
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
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

  // the next and previous version of agenda is set in agenda-approve-service, read-only in frontend
  previousVersion: belongsTo('agenda', {
    inverse: 'nextVersion',
    serialize: false,
  }),
  nextVersion: belongsTo('agenda', {
    inverse: 'previousVersion',
    serialize: false,
  }),
  isDesignAgenda: reads('status.isDesignAgenda'),

  isApproved: reads('status.isApproved'),

  async asyncCheckIfDesignAgenda() {
    await this.get('status');

    return this.get('isDesignAgenda');
  },

  // TODO This computed property is used in:
  // - agenda template
  // - agenda::AgendaHeader::AgendaVersionActions
  // Refactor these uses and remove this computed property
  agendaName: computed('serialnumber', 'status.isDesignAgenda', function() {
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
});
