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

  async getNameForNextSubcase(givenSubcase, type) {
    const subcases = await this.store.query('subcase', {
      filter: {
        case: { id: this.get('id') },
        // "is-archived": false,
      },
      include: "phases,phases.code,type",
      sort: 'created'
    });

    const filteredSubcases = subcases.filter((subcase) => subcase.get('id') !== givenSubcase.get('id'))

    if (filteredSubcases.length === 0) {
      const label = type.get('label');
      if (givenSubcase && label === CONFIG.phasesCodes[0].label) {
        return CONFIG.resultSubcaseName;
      } else {
        return label;
      }
    } else {
      let counter = 0;

      for (let i = 0; i < filteredSubcases.length; i++) {
        const subcase = filteredSubcases.objectAt(i);
        const subcaseTypeLabel = await subcase.type;
        if (subcaseTypeLabel) {
          if (subcaseTypeLabel.get('label') === CONFIG.phasesCodes[0].label) {
            counter++;
          }
        }
      }
      if (type.label === CONFIG.phasesCodes[0].label) {
        if (counter === 0) {
          counter++;
          return `${counter}ste ${type.label}`;
        } else if (counter > 0) {
          counter++;
          return `${counter}de ${type.label}`;
        }
      } else {
        return type.label;
      }
    }
  },
});
