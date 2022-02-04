import Component from '@glimmer/component';
// import { action } from '@ember/object';
import { inject as service } from '@ember/service';
// import { tracked } from '@glimmer/tracking';
// import { task } from 'ember-concurrency-decorators';
// import { all } from 'ember-concurrency';

/**
 * @argument {translationSubcase}
 * @argument {requestActivity}
 */
export default class PublicationsPublicationTranslationTranslationRequestedPanel extends Component {
  @service store;

  constructor() {
    super(...arguments);
  }

}
