import Mixin from '@ember/object/mixin';

export default Mixin.create({
	routeNamePrefix: null,
	modelName: 'agendaitem',
	filter: null,
	sort: null,
	page: 0,
	size: 10,
	include: null,

	model() {
		const filter = {
			agenda: {
				id: this.modelFor(`print-overviews.${this.routeNamePrefix}`).get('id'),
			},
			subcase: {
				'show-as-remark': false
			},
		};
		this.set('filter', filter);
		return this.store.query(`${this.modelName}`, {
			filter,
			include: this.get('include'),
			sort: this.get('sort'),
			page: {
				size: this.get('size'),
				number: this.get('page')
			},
		}).then((items) => {
			return items.toArray();
		})
	},

	setupController(controller) {
		this._super(...arguments)
		controller.set('filter', this.filter);
		controller.set('sort', this.sort);
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
