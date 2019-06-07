import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	store: inject(),
	classNames: ['vl-u-spacer'],
	isShowingVersions: false,
	isEditing: false,

	async addNewsItem(subcase, agendaitem) {
		const news = this.store.createRecord("newsletter-info", {
			subcase: subcase,
			created: new Date(),
			title: await agendaitem.get('shortTitle')
		});
		await news.save();
	},

	actions: {
		showDocuments() {
			this.toggleProperty('isShowingVersions');
		},
		async toggleIsEditing() {
			const { agendaitem } = this;
			const subcase = await agendaitem.get('subcase');
			const newsletter = await subcase.get('newsletterInfo');
			if (!newsletter) {
				await this.addNewsItem(subcase, agendaitem);
			} else {
				if (!newsletter.get('title')) {
					newsletter.set('title', agendaitem.get('shortTitle'));
					await newsletter.save();
				}
			}

			this.toggleProperty('isEditing');
		}
	}
});
