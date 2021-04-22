import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationDocumentsFilterComponent extends Component {
  @inject store;
  @inject fileService;

  @tracked documentTypes = [];
  @tracked fileTypes = [];
  @tracked state;

  constructor(owner, args) {
    super(owner, args);

    // clone for internal use
    this.filter = this.args.filter.clone();
  }

  @action
  reset() {
    this.filter.reset();

    const filter = this.filter.clone();
    this.args.onChange(filter);
  }

  @action
  apply() {
    const filter = this.filter.clone();
    this.args.onChange(filter);
  }
}
