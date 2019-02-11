import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	public: attr('boolean'),
	documentType: attr('string'),
	documentVersions: hasMany('document-versions'),
	subcase: belongsTo('subcase'),

	sortedDocuments: computed.sort('documentVersions', function(a, b) {
		if (a.versionNumber > b.versionNumber) {
      return 1;
    } else if (a.versionNumber < b.versionNumber) {
      return -1;
    }

    return 0;
	})
});
