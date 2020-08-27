import Component from '@glimmer/component';
import {
  computed, action
} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaItemDecisionEditComponent extends Component {
  @tracked treatment = this.args.agendaItemTreatment;

  async setNewPropertiesToModel(model) {
    const {
      propertiesToSet,
    } = this;
    await Promise.all(
      propertiesToSet.map(async(property) => {
        model.set(property, await this.get(property));
      })
    );
    return model.save().then((model) => model.reload());
  }

  @computed('editor.currentTextContent')
  get richtext() {
    if (!this.editor) {
      return '';
    }
    return this.editor.rootNode.innerHTML.htmlSafe();
  }

  @action
  changeDecisionResultCode(resultCode) {
    this.treatment.set('decisionResultCode', resultCode);
  }

  // eslint-disable-next-line generator-star-spacing
  @(task(function* () {
    yield this.treatment.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  })) saveTreatment;

  @action
  cancelEdit() {
    this.treatment.belongsTo('decisionResultCode').reload(); // "rollback relationship"
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    return this.treatment;
  }

  @action
  descriptionUpdated(val) {
    this.set('initValue', this.richtext + val);
  }

  @action
  async handleRdfaEditorInit(editorInterface) {
    this.set('editor', editorInterface);
  }
}
