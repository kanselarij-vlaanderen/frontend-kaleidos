import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['vl-u-spacer-extended-l'],
	store: inject(),
	agendaitem:null,
	isEditing:false,

	async addNewsItem(agendaitem){
		const news = this.store.createRecord("newsletter-info", {
			agendaitem: agendaitem,
			created: new Date(),
			subtitle: await agendaitem.get('subcase.title')
		});
		await news.save();
	},

	actions: {
		async toggleIsEditing() {
			const { agendaitem } = this;
			const newsletter = await agendaitem.get('newsletterInfo');
			if (!newsletter) {
				await this.addNewsItem(agendaitem);
			}
			this.toggleProperty('isEditing');
		},

		async saveChanges(agendaitem) {
			let newsItem = await agendaitem.get('newsletterInfo');
			newsItem.set('publicationDate', new Date());
			newsItem.save().then(() => {
				this.toggleProperty('isEditing');
			})
		}
	}
});
