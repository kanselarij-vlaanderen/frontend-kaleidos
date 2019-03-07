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

  click(event) {
    this.selectAnnouncement(this.get('announcement'));
  },
});
