import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
	classNames: ['vlc-padding-bottom--large'],
	store: inject(),
	agendaitem: null,
	isEditing: false,

	async addNewsItem(agendaitem) {
		const news = this.store.createRecord("newsletter-info", {
			agendaitem: agendaitem,
			created: new Date(),
			finished: false,
			title: await agendaitem.get('subcase.title')
		});
		agendaitem.set('newsletterInfo', news);
	},

	actions: {
		async toggleIsEditing() {
			const { agendaitem } = this;
			const newsletter = await agendaitem.get('newsletterInfo');
			if (!newsletter) {
				await this.addNewsItem(agendaitem);
			} else {
				if (!newsletter.get('title')) {
					newsletter.set('title', agendaitem.get('title'));
					// await newsletter.save();
					await this.updateModifiedProperty(await agendaitem.get('agenda'));
				}
			}
			this.toggleProperty('isEditing');
		},

		async saveChanges(agendaitem) {
			const newsItem = await agendaitem.get('newsletterInfo');
			newsItem.set('publicationDate', new Date());

			await newsItem.save().then(async () => {
				await this.updateModifiedProperty(await agendaitem.get('agenda'));
				this.toggleProperty('isEditing');
			})
		}
	}
});
