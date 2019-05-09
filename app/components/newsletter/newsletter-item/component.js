import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	store:inject(),
	classNames:['vl-u-spacer vl-col--3-4'],
	isShowingVersions:false, 
	isEditing:false,

	async addNewsItem(agendaitem){
		const news = this.store.createRecord("newsletter-info", {
			agendaitem: agendaitem,
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
			const newsletter = await agendaitem.get('newsletterInfo');
			if (!newsletter) {
				await this.addNewsItem(agendaitem);
			} else {
				if(!newsletter.get('title')) {
					newsletter.set('title', agendaitem.get('shortTitle'));
					await newsletter.save();
				}
			}

			this.toggleProperty('isEditing');
		}
	}
});
