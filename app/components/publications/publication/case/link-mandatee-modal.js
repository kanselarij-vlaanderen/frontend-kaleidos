import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees)
 * @callback {() => Promise} onClose
 * @callback {(mandatee: Mandatee) => Promise} onLink
 * @dependsOn {Mandatee[]} mandatees ('mandatee,mandatee.person')
 */
export default class PublicationsPublicationCaseLinkMandateeModalComponent extends Component {
  @service store;

  @tracked options;
  @tracked selection;

  constructor() {
    super(...arguments);

    this.loadData();
  }

  get isLoading() {
    return this.init.isRunning || this.onLink.isRunning;
  }

  @task
  *init() {
    yield this.loadData();
    this.search('');
  }

  async loadData() {
    const mandatees = this.store.peekAll('mandatee');
    this.options = mandatees.filter((mandatee) => !this.isLinked(mandatee));
  }

  @action
  search(searchText) {
    const searchTextLC = searchText.toLowerCase();
    return this.options.filter((mandatee) => this.match(searchTextLC, mandatee));
  }

  isLinked(mandatee) {
    return this.args.publicationFlow.mandatees.includes(mandatee);
  }

  match(searchTextLC, mandatee) {
    const fullName = mandatee.person.get('fullName');
    const fullNameMatches = fullName.toLowerCase()
      .includes(searchTextLC);
    return fullNameMatches;
  }

  @action
  select(mandatee) {
    this.selection = mandatee;
  }

  get canLink() {
    return !!this.selection;
  }

  @task
  *onLink() {
    this.args.publicationFlow.mandatees.addObject(this.selection);
    yield this.args.publicationFlow.save();
    yield this.args.onLink(this.selection);
  }
}
