import Component from '@ember/component';

export default Component.extend({
	title:null,

	actions: {
		createSingleNewsLetter() {
			const { title } = this;
			console.log(title)
		}
	}
});
