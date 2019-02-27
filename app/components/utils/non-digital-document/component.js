import Component from '@ember/component';

export default Component.extend({
	classNames: ["vl-col--4-4 vl-spacer-box vl-u-spacer-extended-top-s"],

	actions: {
		removeDocument(document) {
			this.removeDocument(document);
		}
	}
});
