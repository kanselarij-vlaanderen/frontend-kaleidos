import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


/**
 * @argument {PublicationFlow} selected
 * @argument {{ id: string, identification: string }} options
 * @argument {(publicationFlow: { id: string, identification: string }) => void} onChange
 */
export default class PublicationsViaCouncilOfMinistersPublicationFlowSelectorComponent extends Component {
  @service store;

  @tracked options = [];

  get selected() {
    if (!this.args.selected) {
      return undefined;
    }
    // .get('id'): Ember complains about .id syntax
    const id = this.args.selected.get('id');
    const selected = this.options.findBy('id', id);
    return selected || this.args.selected;
  }

  // onOpen event:
  //  searchText is cleared when the select has been closed.
  //  this does not trigger an onInput or search event
  @action
  onOpen(select) {
    if (!select.searchText) {
      this.loadData();
    }
  }

  @action
  // onInput event: search event does not fire when input is cleared
  // when used for a non-empty searchText, the input is cleared
  //  so we need both events.
  onInput(searchText) {
    if (!searchText) {
      this.loadData();
    }
  }

  @action
  search(searchText) {
    this.loadData(searchText);
  }

  async loadData(searchText) {
    let publicationFlows = await this.store.query('publication-flow', {
      'filter[identification][:gte:id-name]': searchText,
      'page[size]': 10,
      sort: 'identification.id-name',
      include: 'identification',
    });
    publicationFlows = publicationFlows.toArray();
    if (searchText) {
      publicationFlows = publicationFlows.filter((pub) => pub.identification.get('idName').startsWith(searchText));
    }
    this.options = publicationFlows;
  }

  @action
  onChange(selected) {
    this.args.onChange(selected);
  }
}
