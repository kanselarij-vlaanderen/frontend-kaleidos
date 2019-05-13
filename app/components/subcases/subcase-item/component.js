import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-procedure-step"],
	classNameBindings: ["getClassNames"],

	getClassNames: computed('isMinimal', function () {
		const { isMinimal } = this;
		if (isMinimal) {
			return 'vlc-procedure-step--minimal';
		}
	}),

	onAgendaInfo: computed('subcase.phases.@each', async function () {
		const { subcase } = this;
		const subcasePhases = await subcase.get('phases');
		return subcasePhases.find(async (phase) => {
			const code = await phase.get('code');
			const label = code.get('label');
			if (label && label.toLowerCase() == "geagendeerd") {
				console.log('reached', label, phase)
				return phase;
			}
		});
	})
});
