import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency-decorators';

/**
 * @argument {PublicationFlow} selected (expects related identification to be loaded)
 * @argument {(publicationFlow: PublicationFlow) => void} onChange
 */
export default class PublicationsViaCouncilOfMinistersPublicationFlowSelectorComponent extends Component {
  @tracked selectedIdentification;
  @inject store;

  constructor() {
    super(...arguments);

  }

  @keepLatestTask
  *loadData(value) {
    let identifications;
    if (this.args.publicationFlow) {
      identifications = [this.args.publicationFlow.identification];
    } else {
      const filterIdName = value ? {
        'filter[id-name]': value,
      } : {};
      identifications = yield this.store.query('identification', {
        ...filterIdName,
        'filter[:has:publication-flow]': true,
        'page[size]': 10,
      });
      identifications = identifications.toArray();
    }

    return identifications;
  }

  @action
  search() {
    this.loadData.perform(this.selectedIdentification);
  }

  @action
  async onChange(identifier) {
    const publicationFlow = await identifier.publicationFlow;
    this.onChange(publicationFlow);
  }
}
