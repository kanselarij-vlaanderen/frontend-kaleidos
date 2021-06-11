import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

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

  loadData() {
    // fetcha all: mu-cl-resources does not support filtering on firstName + lastName
    this.mandatees = this.store.findAll('mandatee', {
      include: 'person',
    });
  }

  @action
  search(searchText) {
    const searchTextLC = searchText.toLowerCase();
    this.options = this.mandatees.filter((mandatee) => this.match(searchTextLC, mandatee));
  }

  match(searchTextLC, mandatee) {
    const isLinked = this.args.publicationFlow.mandatees.includes(mandatee);
    if (isLinked) {
      return false;
    }
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
    this.args.onLink(this.selection);
  }
}
