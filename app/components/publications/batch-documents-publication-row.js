import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * @argument {Piece} piece
 * @argument {Case} case
 * @argument {function(Piece, PublicationFlow)} onLinkPublicationFlow
 * @argument {function(Piece)} onUnlinkPublicationFlow
 * @argument {function(Piece)} onOpenNewPublicationModal
 */
export default class PublicationsBatchDocumentsPublicationRowComponent extends Component {
  @service intl;

  linkModeOptions = [
    {
      isEnabledLink: true,
      label: this.intl.t('existing'),
    },
    {
      isEnabledLink: false,
      label: this.intl.t('none'),
    },
  ];

  @tracked selectedLinkModeOption;
  @tracked selectedPublicationFlow;

  constructor() {
    super(...arguments);
    this.initSelectedOptions();
  }

  @action
  async initSelectedOptions() {
    this.selectedPublicationFlow = await this.args.piece.publicationFlow;
    const isEnabledLink = !!this.selectedPublicationFlow;
    this.selectedLinkModeOption = this.linkModeOptions.find(
      (opt) => opt.isEnabledLink === isEnabledLink
    );
  }

  get isLinkingRunning() {
    return (
      this.selectLinkModeOption.isRunning ||
      this.selectPublicationFlow.isRunning
    );
  }

  @task
  *selectLinkModeOption(option) {
    this.selectedLinkModeOption = option;

    if (!option.isEnabledLink) {
      yield this.args.onUnlinkPublicationFlow(this.args.piece);
    }
  }

  @task
  *selectPublicationFlow(publicationFlow) {
    if (publicationFlow) {
      yield this.args.onLinkPublicationFlow(this.args.piece, publicationFlow);
    } else {
      yield this.args.onUnlinkPublicationFlow(this.args.piece);
    }
  }
}
