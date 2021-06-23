import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees)
 * @callback {() => Promise} onClose
 * @callback {(mandatee: Mandatee) => Promise} onLink
 * @dependsOn {Mandatee[]} mandatees ('mandatee,mandatee.person')
 */
export default class PublicationsPublicationCaseLinkMandateeModalComponent extends Component {
  @tracked selection;

  get isLoading() {
    return this.onLink.isRunning;
  }

  get canLink() {
    return !!this.selection;
  }

  @task
  *onLink() {
    yield this.args.onLink(this.selection);
  }
}
