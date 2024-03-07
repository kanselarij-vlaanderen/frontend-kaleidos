import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { A } from '@ember/array';

function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}

export default class AgendaController extends Controller {
  @service router;

  @tracked isLoading = false;
  @tracked isOpenSideNav = true;

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
  openSideNav() {
    this.isOpenSideNav = true;
  }

  @action
  collapseSideNav() {
    this.isOpenSideNav = false;
  }

  get notaGroups() {
    const agendaitems = this.model.notas;
    if (agendaitems.length > 0) {
      const mandatees = agendaitems.firstObject.mandatees;
      let currentSubmittersArray = mandatees.sortBy('priority');
      let currentItemArray = A([]);
      const groups = [];
      groups.pushObject(currentItemArray);
      for (let index = 0; index < agendaitems.length; index++) {
        const agendaitem = agendaitems.objectAt(index);
        const mandatees = agendaitem.mandatees;
        const subm = mandatees.sortBy('priority');
        if (equalContentArrays(currentSubmittersArray, subm)) {
          currentItemArray.pushObject(agendaitem);
        } else {
          currentItemArray = A([agendaitem]);
          groups.pushObject(currentItemArray);
          currentSubmittersArray = subm;
        }
      }
      return groups;
    }
    return A([]);
  }
}
