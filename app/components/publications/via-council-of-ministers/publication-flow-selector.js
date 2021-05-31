import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

/**
 * @argument {Identification} selected
 * @argument {(identification: Identification) => void} onChange
 */
export default class PublicationsViaCouncilOfMinistersPublicationFlowSelectorComponent extends Component {
  @service store;

  @tracked options;

  constructor() {
    super(...arguments);
    this.selected = this.args.selected;
  }

  @action
  onFocus() {
    this.loadData.perform();
  }

  @action
  onInput() {
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData(identification) {
    let filterIdName = {};
    if (identification) {
      filterIdName = {
        'filter[id-name]': identification.idName,
      };
    }

    let identifications = yield this.store.query('identification', {
      ...filterIdName,
      'filter[:has:publication-flow]': true,
      'page[size]': 10,
    });
    identifications = identifications.toArray();
    this.options = identifications;
  }

  @action
  onChange() {
    this.args.onChange(this.selected);
  }
}
