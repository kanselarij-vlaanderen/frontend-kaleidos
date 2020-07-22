import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, computed
} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';
import moment from 'moment';

export default class AgendaitemNewsItem extends Component {
  @service store;

  @service newsletterService;

  @service agendaService;

  @service sessionService;

  @service currentSession;

  @service intl;

  classNames = ['vlc-padding-bottom--large'];

  subcase = null;

  agendaitem = null;

  isEditing = false;

  @tracked timestampForMostRecentNota = null;

  @computed('subcase.newsletterInfo')
  get item() {
    return this.subcase.get('newsletterInfo');
  }

  get dateOfMostRecentNota() {
    return moment(this.timestampForMostRecentNota).format('D MMMM YYYY');
  }

  get timeOfMostRecentNota() {
    return moment(this.timestampForMostRecentNota).format('H:mm');
  }

  async didUpdateAttrs() {
    this.timestampForMostRecentNota = await this.agendaService.retrieveModifiedDateFromNota(this.agendaitem, this.subcase);
  }

  @action
  async toggleIsEditing() {
    this.set('isLoading', true);
    const newsletterInfo = await this.subcase.get('newsletterInfo');
    if (!newsletterInfo) {
      await this.newsletterService.createNewsItemForSubcase(subcase, this.agendaitem);
    }
    this.set('isLoading', false);
    this.toggleProperty('isEditing');
  }

  @action
  async saveChanges(subcase) {
    this.set('isLoading', true);
    const newsletterInfo = await subcase.get('newsletterInfo');

    await newsletterInfo.save().then(async() => {
      await updateModifiedProperty(await this.get('agendaitem.agenda'));
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    });
  }

  @action
  async clearTimestampForMostRecentNota() {
    this.timestampForMostRecentNota = false;
  }
}
