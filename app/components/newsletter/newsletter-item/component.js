import Component from '@ember/component';

export default Component.extend({
	classNames:['vl-u-spacer'],
	isShowingVersions:false, 
	actions: {
		showDocuments() {
			this.toggleProperty('isShowingVersions');
		}
	}
});
