import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  intl: inject(),
  richtext: attr("string"),
  shortTitle: attr("string"),
  approved: attr('boolean'),
  archived: attr('boolean'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),

  subcase: belongsTo('subcase', { inverse: null }),
  publication: belongsTo('publication'),
  documentType: belongsTo('document-type'),
  documentVersions: hasMany('document-version', { inverse: null }),
  signedDocument: belongsTo('document'),

  decisionApproval: computed('signedDocument', function () {
    return this.intl.t('signed-document-decision', { name: this.get('signedDocument.numberVr') })
  })
});
