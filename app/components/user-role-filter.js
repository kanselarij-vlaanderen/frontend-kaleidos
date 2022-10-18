import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @param selected {Role[]}
 * @param defaultEnableAllRoles {boolean}
 */
export default class UserRoleFilterComponent extends Component {
  @service store;

  @tracked _selected;
  @tracked roles;

  get selected() {
    return this._selected ?? this.args.selected;
  }

  set selected(selected) {
    this._selected = selected;
  }


  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @action
  toggleRole(role) {
    if (this.selected.includes(role)) {
      this.selected.splice(this.selected.indexOf(role), 1);
    } else {
      this.selected.push(role);
    }
    this.args.onChange?.(this.selected);
  }

  @task
  *loadData() {
    this.roles = yield Promise.all([
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.ADMIN),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.SECRETARIE),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.OVRB),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.KORT_BESTEK),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.MINISTER),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.KABINET_DOSSIERBEHEERDER),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.KABINET_MEDEWERKER),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.OVERHEIDSORGANISATIE),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.OVERLEGCOMITE_RAADGEVER),
      this.store.findRecordByUri('role', CONSTANTS.USER_ROLES.VLAAMS_PARLEMENT),
    ]);
    if (this.args.defaultEnableAllRoles) {
      this.selected = this.roles;
      this.args.onChange?.(this.selected);
    }
  }
}
