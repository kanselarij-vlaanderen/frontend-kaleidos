import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['vl-u-spacer-extended-l'],
	store: inject(),
	agendaitem:null,
	isEditing:false,

	actions: {
		async addNewsItem(agendaitem){
      const news = this.store.createRecord("newsletter-info", {
				agendaitem: agendaitem,
				created: new Date(),
				subtitle: await agendaitem.get('subcase.title')
      });
      news.save().then(() => {
				this.toggleProperty('isEditing')
			});
		},

		toggleIsEditing() {
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
