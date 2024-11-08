import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaController extends Controller {
  @service router;
  @service responsive;
  @service resize;

  @tracked isLoading = false;
  @tracked isOpenSideNav = this.responsive.isTablet ? false : true;

  constructor() {
    super(...arguments);

    this.resize.on('resize', () => {
      this.isOpenSideNav = this.responsive.isTablet ? false : true;
    })
  }

  get meetingKindPrefix() {
    return this.model.meeting.kind.get('uri') == CONSTANTS.MEETING_KINDS.PVV ? 'MR VV' : 'MR';
  }

  @action
  enableIsLoading() {
    this.isLoading = true;
  }

  @action
  disableIsLoading() {
    this.isLoading = false;
  }

  @action
  refresh() {
    this.router.refresh('agenda');
  }

  @action
  collapseSideNav() {
    this.isOpenSideNav = false;
  }

  @action
  openSideNav() {
    this.isOpenSideNav = true;
  }
}
