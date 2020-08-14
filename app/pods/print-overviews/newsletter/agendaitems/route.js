import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  currentSession: service(),

  sort: 'priority',

  async model() {
    const newsletterInfos = await this.store
      .query('newsletter-info', {
        'filter[agenda-item-treatment][agendaitem][agenda][:id:]': this.modelFor('print-overviews.newsletter').get('id'),
        'filter[agenda-item-treatment][agendaitem][show-as-remark]': false,
        'filter[agenda-item-treatment][agendaitem][is-approval]': false,
        include: 'agenda-item-treatment,agenda-item-treatment.agendaitem,agenda-item-treatment.agendaitem.mandatees',
        sort: 'agenda-item-treatment.agendaitem.priority',
        'page[size]': 300,
      });
    return newsletterInfos;
  },

  actions: {
    refresh() {
      this.refresh();
    },
  },
});
