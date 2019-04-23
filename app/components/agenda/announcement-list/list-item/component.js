import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ["vlc-agenda-item"],
  classNameBindings: ["getClassNames"],
  tagName: 'a',
  index:null,
  
  getClassNames: computed('announcement', 'selectedAnnouncement', function() {
    if(this.get('announcement.id') == this.get('selectedAnnouncement.id')) {
      return 'vlc-agenda-item--active';
    }
  }),

  documents: computed('announcement.documentVersions.@each', function() {
		return this.get('announcement.documents');
	}),

	filteredDocumentVersions: computed('documents.@each', async function() {
    const documents = await this.get('documents');
		return Promise.all((documents).map(async (document) => {
			return await document.getDocumentVersionsOfItem(this.get('announcement'));
		}))
	}),

	lastVersions: computed('filteredDocumentVersions.@each', async function() {
		const filteredDocumentVersions = await this.get('filteredDocumentVersions');
		return filteredDocumentVersions.map((documents) => {
			return documents.get('firstObject');
		})
	}),

  click(event) {
    this.selectAnnouncement(this.get('announcement'));
  },
});
