import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  modelName: alias('constructor.modelName'),
  intl: inject(),
  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  publicationDate: attr('date'),
  publicationDocDate: attr('date'),
  remark: attr('string'),
  subcase: belongsTo('subcase'),

  meeting: belongsTo('meeting', { inverse: null }),
  documentVersions: hasMany('document-version', { inverse: null }),
  displayRemark: computed('remark', 'intl', function() {
    const remark = this.get('remark');
    if (remark && remark != '') {
      return `${this.intl.t('remark')}: ${this.get('remark')}`;
    } else {
      return '';
    }
  }),
});
