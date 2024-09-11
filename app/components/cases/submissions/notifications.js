import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';

export default class CasesSubmissionsNotificationsComponent extends Component {
  @service store;
  @service toaster;

  @tracked showApprovalAddressModal = false;
  @tracked showNotificationAddressModal = false;
  @tracked emailSettings;
  @tracked isEditing = false;
  @tracked approvalAddresses;
  @tracked approvalComment;
  @tracked notificationAddresses;
  @tracked notificationComment;

  constructor() {
    super(...arguments);
    if (this.args.isEditing) {
      this.isEditing = true;
    }
    this.init();
    this.loadEmailSettings.perform();
  }

  init = () => {
    this.approvalAddresses = new TrackedArray([...this.args.approvalAddresses]);
    this.approvalComment = this.args.approvalComment;
    this.notificationAddresses = new TrackedArray([...this.args.notificationAddresses]);
    this.notificationComment = this.args.notificationComment;
  };

  loadEmailSettings = task(async () => {
    this.emailSettings = await this.store.queryOne(
      'email-notification-setting'
    );
    if (this.emailSettings) {
      await this.updateDefaultAddresses.perform();
    } else {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
    }
  });

  updateDefaultAddresses = task({ maxConcurrency: 1, enqueue: true }, async () => {
    this.addApprovalAddress(this.defaultApprovalAddress, true);
    this.removeNotificationAddress(this.unusedDefaultNotificationAddress);
    for (const address of this.defaultNotificationAddresses) {
      this.addNotificationAddress(address, true);
    }
    this.changeNotificationData();
  });

  get defaultApprovalAddress() {
    return this.emailSettings?.cabinetSubmissionsSecretaryEmail;
  }

  get defaultNotificationAddresses() {
    if (this.args.confidential) {
      return [this.emailSettings?.cabinetSubmissionsIkwConfidentialEmail];
    } else if (this.args.hasConfidentialPieces) {
      return [
        this.emailSettings?.cabinetSubmissionsIkwEmail,
        this.emailSettings?.cabinetSubmissionsIkwConfidentialEmail
      ];
    }
    return [this.emailSettings?.cabinetSubmissionsIkwEmail];
  }

  get unusedDefaultNotificationAddress() {
    if (this.args.confidential) {
      return this.emailSettings?.cabinetSubmissionsIkwEmail;
    } else {
      return this.emailSettings?.cabinetSubmissionsIkwConfidentialEmail;
    }
  }

  // don't use this getter while initializing
  get notificationData() {
    return {
      approvalAddresses: this.approvalAddresses,
      approvalComment: this.approvalComment,
      notificationAddresses: this.notificationAddresses,
      notificationComment: this.notificationComment
    }
  }

  @action
  isDefaultApprovalAddress(address) {
    return address === this.defaultApprovalAddress;
  }

  @action
  isDefaultNotificationAddress(address) {
    return this.defaultNotificationAddresses.includes(address);
  }

  @action
  addApprovalAddress(address, insertAsFirst) {
    if (!this.approvalAddresses.includes(address)) {
      if (insertAsFirst === true) {
        this.approvalAddresses.splice(0, 0, address)
      } else {
        this.approvalAddresses.push(address);
      }
      if (!this.updateDefaultAddresses.isRunning) {
        this.changeNotificationData();
      }
    }
    this.showApprovalAddressModal = false;
  }

  @action
  removeApprovalAddress(address) {
    const index = this.approvalAddresses.indexOf(address);
    if (index > -1) {
      this.approvalAddresses.splice(index, 1);
      if (!this.updateDefaultAddresses.isRunning) {
        this.changeNotificationData();
      }
    }
  }

  @action
  addNotificationAddress(address, insertAsFirst) {
    if (!this.notificationAddresses.includes(address)) {
      if (insertAsFirst === true) {
        this.notificationAddresses.splice(0, 0, address)
      } else {
        this.notificationAddresses.push(address);
      }
      if (!this.updateDefaultAddresses.isRunning) {
        this.changeNotificationData();
      }
    }
    this.showNotificationAddressModal = false;
  }

  @action
  removeNotificationAddress(address) {
    const index = this.notificationAddresses.indexOf(address);
    if (index > -1) {
      this.notificationAddresses.splice(index, 1);
      if (!this.updateDefaultAddresses.isRunning) {
        this.changeNotificationData();
      }
    }
  }

  cancel = () => {
    this.args.onCancelNotificationData?.();
    this.init();
    this.isEditing = false;
  };

  changeNotificationData = () => {
    // no submission - new submission form
    // submission - when not actually editing we are updating based on "did-update" and should call parent
    if (!this.args.submission || this.args.submission && !this.isEditing) {
      this.args.onNotificationDataChanged?.(this.notificationData);
    }
  };

  saveNotificationData = task(async () => {
    await this.args.onSaveNotificationData?.(this.notificationData);
    this.isEditing = false;
  });

  @action
  onChangeApprovalComment(newComment) {
    this.approvalComment = trimText(newComment);
    this.changeNotificationData();
  }

  @action
  onChangeNotificationComment(newComment) {
    this.notificationComment = trimText(newComment);
    this.changeNotificationData();
  }
}
