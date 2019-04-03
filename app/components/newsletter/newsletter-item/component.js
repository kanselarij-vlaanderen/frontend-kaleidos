import Component from '@ember/component';

export default Component.extend({
	classNames:['vl-u-spacer'],
	isShowingVersions:false, 
	isEditing:false,
	
	actions: {
		showDocuments() {
			this.toggleProperty('isShowingVersions');
		},
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
