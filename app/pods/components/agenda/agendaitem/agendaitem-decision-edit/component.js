import Component from '@ember/component';
import {cached} from 'fe-redpencil/decorators/cached';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import moment from 'moment';

export default class AgendaItemDecisionEditComponent extends Component {
  @service store;
  @tracked treatment = this.args.agendaItemTreatment;
  @tracked decisionResultCodes = [];
  @tracked decisionResultCodesLoaded = false;

  constructor() {
    super(...arguments);
    this.store.findAll('decision-result-code', {reload: true}).then(codes => {
      this.decisionResultCodes = codes;
      this.decisionResultCodesLoaded = true;
    });
  }

  async setNewPropertiesToModel(model) {
    const {
      propertiesToSet,
    } = this;
    await Promise.all(
      propertiesToSet.map(async (property) => {
        model.set(property, await this.get(property));
      })
    );
    return model.save().then((model) => model.reload());
  }

  @action
  fetchDecisionResultCodes() {
    this.findDecisionResultCodes.perform(); // Load codelist
  }

  richtext: computed('editor.currentTextContent', function() {
      if (!this.editor) {
        return;
      }
      return this.editor.rootNode.innerHTML.htmlSafe();
  });

  @action
  changeDecisionResultCode(resultCode) {
    this.treatment.set('decisionResultCode', resultCode);
  }

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
