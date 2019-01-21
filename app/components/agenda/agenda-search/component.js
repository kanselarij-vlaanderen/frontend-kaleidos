import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	classNames: ["agenda--search"],
	tagName: "div",
	currentAgenda: null,
	agendas: null,

	actions: {
		chooseAgenda(agenda) {
			this.set("currentAgenda", agenda);
		}
	}
});
