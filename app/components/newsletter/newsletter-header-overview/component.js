import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-page-header', 'vl-u-bg-alt', 'no-print'],
  session: inject(),
  routing: inject('-routing'),
  agendaService: inject(),

  shouldShowPrintButton: computed('routing.currentRouteName', function() {
    return this.routing.get('currentRouteName').includes(`newsletter.overview`);
  }),

  actions: {
    print() {
      window.print();
    },

    async sendNewsletter() {
      const agenda = await this.get('agenda');
      this.get('agendaService').sendNewsletter(agenda);
    }
  }
});
