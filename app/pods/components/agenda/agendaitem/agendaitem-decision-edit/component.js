import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  computed, action, tracked
} from '@ember/object';
import { task } from 'ember-concurrency';

export default class AgendaItemDecisionEditComponent extends Component {
  @service store;
  @tracked treatment = this.args.agendaItemTreatment;
  @tracked decisionResultCodes = [];
  @tracked decisionResultCodesLoaded = false;

  constructor() {
    super(...arguments);
    this.store.findAll('decision-result-code', {
      reload: true,
    }).then((codes) => {
      this.decisionResultCodes = codes;
      this.decisionResultCodesLoaded = true;
    });
  }

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

  @action
  fetchDecisionResultCodes() {
    this.findDecisionResultCodes.perform(); // Load codelist
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

  @task
  saveTreatment = function *() {
    yield this.treatment.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  }

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
