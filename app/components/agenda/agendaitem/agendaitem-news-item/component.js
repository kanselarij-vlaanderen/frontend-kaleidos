import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
	classNames: ['vlc-padding-bottom--large'],
	store: inject(),
	subcase: null,
	agendaitem: null,
	isEditing: false,
	intl: inject(),

	item: computed('subcase.newsletterInfo', function () {
		return this.get('subcase.newsletterInfo');
	}),

	async addNewsItem(subcase) {
		const news = this.store.createRecord("newsletter-info", {
			subcase: await subcase,
			created: moment().utc().toDate(),
			finished: false,
			title: await subcase.get('title'),
			subtitle: await subcase.get('shortTitle')
		});
		subcase.set('newsletterInfo', news);
	},

	actions: {
		async toggleIsEditing() {
			this.set('isLoading', true);
			const subcase = await this.get('subcase');
			const newsletter = await subcase.get('newsletterInfo');
			if (!newsletter) {
				await this.addNewsItem(subcase);
			} else {
				if (!newsletter.get('title')) {
					newsletter.set('title', subcase.get('title'));
					await this.updateModifiedProperty(await this.agendaitem.get('agenda'));
				}
			}
			this.set('isLoading', false);
			this.toggleProperty('isEditing');
		},

		async saveChanges(subcase) {
			this.set('isLoading', true);
			const newsItem = await subcase.get('newsletterInfo');
			newsItem.set('publicationDate', moment().utc().toDate());

			await newsItem.save().then(async () => {
				await this.updateModifiedProperty(await this.get('agendaitem.agenda'));
				this.set('isLoading', false);
				this.toggleProperty('isEditing');
			})
		},
	}
});
