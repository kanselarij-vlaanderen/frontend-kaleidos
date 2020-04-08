import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { A } from '@ember/array';

const { Model, attr, hasMany, belongsTo, PromiseObject } = DS;

export default Model.extend({
  store: inject(),
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),

  type: belongsTo('case-type'),
  relatedMeeting: belongsTo('meeting'),

  remark: hasMany('remark'),
  themes: hasMany('theme'),
  subcases: hasMany('subcase'),
  related: hasMany('case'),
  creators: hasMany('person'),
  mandatees: hasMany('mandatee'),

  latestSubcase: computed('subcases.@each', function () {
    return PromiseObject.create({
      promise:
        this.get('subcases').then((subcases) => {
          const sortedSubcases = subcases.sortBy('created');
          return sortedSubcases.get('lastObject');
        })
    })
  }),

  subcaseDocumentVersions: computed('subcases.@each', async function () {
    const subcases = await this.get('subcases');

    const documentVersions = await Promise.all(subcases.map(subcase => subcase.get('documentVersions')));

    return documentVersions.reduce((all, curr) => all.concat(curr.toArray()), A([]))
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
      include: 'type',
      sort: 'created'
    });
  },

  async getNameForNextSubcase(type) {
    const principalApprovalId = CONFIG.principalApprovalId;

    if (!(type.get('id') == principalApprovalId)) {
      return type.get('label');
    }

    const principalApprovalSubcases = await this.getAllSubcasesByTypeId(principalApprovalId);

    //TODO translate
    //TODO 8ste ipv 8de,  8e ?
    const length = principalApprovalSubcases.get('length');
    if (length === 0) {
      return CONFIG.resultSubcaseName;
    } else {
      return `${(length + 1)}de principiële goedkeuring`
    }
  }
});
