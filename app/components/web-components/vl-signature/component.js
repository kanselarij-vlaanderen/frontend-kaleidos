import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	intl: inject(),

	classNames: ["vl-description-data", "vl-u-spacer-extended-bottom", "vl-u-spacer-extended-top-l"],

	downloadUrl: computed('signature.file', function () {
		return this.signature.then((signature) => {
			return signature.get('file').then((file) => {
				return `/files/${file.get('id')}/download`;
			})
		})
	}),

	nameToDisplay: computed('signature.name', function () {
		return this.signature.then((signature) => {
			return `${signature.name}${this.intl.t('divider')}`
		})
	}),

	functionToDisplay: computed('signature.function', function () {
		return this.signature.then((signature) => {
			return `${signature.function}.`;
		})
	}),
});
