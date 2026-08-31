import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  Validator, ValidatorSet
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseOrganizationAddModalComponent extends Component {
  @service store;
  @service intl;
  @service toaster;

  validators;

  @tracked name;
  @tracked identifier;

  constructor() {
    super(...arguments);

    this.initValidators();
  }

  save = task(async () => {
    const organization = this.store.createRecord('organization', {
      name: this.name,
      identifier: isPresent(this.identifier) ? this.identifier : undefined,
    });
    // Check if org is duplicate
    const normalized = this.name?.trim().toLowerCase();
    const existing = await this.store.queryAll('organization', {
      'filter[name]': this.name,
    });
    const duplicate = existing.find(
      (o) => o.name?.trim().toLowerCase() === normalized
    );
    if (duplicate) {
      organization.rollbackAttributes();
      this.toaster.error(
        this.intl.t('organization-with-same-name-exists'),
        this.intl.t('warning-title')
      );
    } else {
      await organization.save();
      await this.args.onSave(organization);
    }
  });

  initValidators() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
    });
  }

  @action
  onInputName(event) {
    this.name = event.target.value;
    this.validators.name.enableError();
  }
}
