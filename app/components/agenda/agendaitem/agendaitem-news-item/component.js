import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['o-scroll'],
	store: inject(),
	agendaitem:null,
	isEditing:false,

	actions: {
		async addNewsItem(agendaitem){
      let news = this.store.createRecord("newsletter-info", {
				agendaitem: agendaitem,
				created: new Date()
      });
      news.save().then(newsLetter => {
				agendaitem.set('newsletterInfo',newsLetter);
				this.toggleProperty('isEditing')
			});
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async saveChanges(agendaitem) {
			let newsItem = await agendaitem.get('newsletterInfo');
			newsItem.save().then(() => {
				this.toggleProperty('isEditing');
			})
		}
	}
});
