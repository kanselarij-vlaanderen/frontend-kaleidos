import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

const { Model, attr, hasMany, belongsTo, PromiseObject } = DS;

export default Model.extend({
  store: inject(),
  created: attr('date'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),

  type: belongsTo('case-type'),
  policyLevel: belongsTo('policy-level'),
  relatedMeeting: belongsTo('meeting'),
  submitter: belongsTo('submitter'),

  remark: hasMany('remark'),
  themes: hasMany('theme'),
  subcases: hasMany('subcase'),
  related: hasMany('case'),
  creators: hasMany('person'),
  mandatees: hasMany('mandatee'),

  OCMeetingNumber: computed('relatedMeeting.number', function () {
    return PromiseObject.create({
      promise: this.get('relatedMeeting').then((meeting) => {
        return meeting.get('number');
      })
    });
  }),

  latestSubcase: computed('subcases.@each', function () {
    return PromiseObject.create({
      promise:
        this.get('subcases').then((subcases) => {
          const sortedSubcases = subcases.sortBy('created');
          return sortedSubcases.get('lastObject');
        })
    })
  }),

  mandateesOfSubcase: computed('subcases', function () {
    const subcases = this.get('subcases');
    if (subcases && subcases.length > 0) {
      const currentSubcase = subcases.sortBy('created').get('lastObject');
      return currentSubcase.get('mandatees');
    } else {
      return [];
    }
  }),

  getAllSubcasesByTypeId(id) {
    return this.store.query('subcase', {
      filter: {
        case: { id: this.get('id') },
        type: { id: id }
      },
      include: "type",
      sort: 'created'
    });
  },

  async getNameForNextSubcase(type) {
    const principalApprovalId = CONFIG.principalApprovalId;

    if (!(type.get('id') == principalApprovalId)) {
      return type.get('label');
    }

    const principalApprovalSubcases = await this.getAllSubcasesByTypeId(principalApprovalId);

    const length = principalApprovalSubcases.get('length');
    if (length === 0) {
      return CONFIG.resultSubcaseName;
    } else {
      return `${(length + 1)}de ${CONFIG.phasesCodes[0].label}`
    }
  }
  
});
