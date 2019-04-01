import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject } from '@ember/service';

export default Route.extend({
	subcasesService: inject(),

	async model() {
		const subcases = await this.store.query('subcase', {
			filter: {
				":has-no:agendaitems": "yes"
			},
			include: ['agendaitems']
		});

		subcases.map(subcase => subcase.set('selected', false));

		const ids = await this.get('subcasesService').getPostPonedSubcaseIds();
		let postPonedSubcases = [];

		if (ids && ids.length > 0) {
			postPonedSubcases = await this.store.query('subcase', {
				filter: {
					"id": ids.toString()
				}
			});
		}

		return hash({ subcases: subcases, postPonedSubcases: postPonedSubcases })
	}
});
