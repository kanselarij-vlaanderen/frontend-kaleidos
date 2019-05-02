import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  description: attr("string"),
  shortTitle: attr("string"),
  approved: attr('boolean'),
  archived: attr('boolean'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),

  subcase: belongsTo('subcase'),
  publication: belongsTo('publication'),
  newsletterInfo: belongsTo('newsletter-info'),
  documentType: belongsTo('document-type'),
  confidentiality: belongsTo('confidentiality'),
  documentVersions: hasMany('document-version', {inverse:null}),
  signedDocumentVersions: hasMany('document-version', {inverse:null}),

  sortedDocumentVersions: computed.sort('signedDocumentVersions', function(a,b) {
		if(a.versionNumber > b.versionNumber) {
			return 1;
		} else if (a.versionNumber < b.versionNumber){
			return -1;
		}
		return 0;
	}),

	latestDocumentVersion: computed('sortedDocumentVersions', function() {
		return this.get('sortedDocumentVersions.lastObject');
	})
});
