import Component from '@ember/component';
import {inject} from '@ember/service';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-padding-bottom--large'],
  store: inject(),
  newsletterService: inject(),
  agendaService: inject(),
  sessionService: inject(),
  subcase: null,
  agendaitem: null,
  isEditing: false,
  intl: inject(),
  @tracked timestampForMostRecentNota: null,
  item: computed('subcase.newsletterInfo', function () {
    return this.get('subcase.newsletterInfo');
  }),

  get dateOfMostRecentNota() {
    return moment(this.timestampForMostRecentNota).format("D MMMM YYYY");
  },

  get timeOfMostRecentNota() {
    return moment(this.timestampForMostRecentNota).format("H:mm");
  },

  async didUpdateAttrs() {
    this.timestampForMostRecentNota = await this.agendaService.retrieveModifiedDateFromNota(this.agendaitem);
  },

  actions: {
    async toggleIsEditing() {
      this.set('isLoading', true);
      const subcase = await this.get('subcase');
      const newsletter = await subcase.get('newsletterInfo');
      if (!newsletter) {
        await this.newsletterService.createNewsItemForSubcase(subcase, this.agendaitem);
      }
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async saveChanges(subcase) {
      this.set('isLoading', true);
      const newsItem = await subcase.get('newsletterInfo');

      await newsItem.save().then(async () => {
        await updateModifiedProperty(await this.get('agendaitem.agenda'));
        this.set('isLoading', false);
        this.toggleProperty('isEditing');
      })
    },
    async clearTimestampForMostRecentNota() {
      this.timestampForMostRecentNota = false;
    },
  }
});
