import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class linkedDocumentLink extends Component {
  // Input
  // this.args.documentContainer
  // this.args.item

  @service currentSession;

  classNameBindings = ['aboutToDelete'];

  @tracked isShowingVersions = false
  @tracked documentToDelete = null;
  @tracked isVerifyingUnlink = false;
  @tracked lastDocumentVersion = null;
  @tracked mySortedDocuments;

  document = null

  get openClass() {
    if (this.isShowingVersions) {
      return 'js-vl-accordion--open';
    }
    return null;
  }

  get setupDocumentVersions() {
    this.mySortedDocumentVersions();
    return true;
  }

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-document-version/component.js
  mySortedDocumentVersions() {
    const itemVersionIds = {};
    const versions = this.args.item.linkedDocumentVersions;
    if (versions) {
      versions.map((item) => {
        itemVersionIds[item.get('id')] = true;
      });
    }
    const documentVersions = this.args.documentContainer.sortedDocumentVersions;
    if (documentVersions) {
      this.mySortedDocuments = documentVersions.filter((item) => itemVersionIds[item.id]);
      if (this.mySortedDocuments) {
        this.lastDocumentVersion = this.mySortedDocuments.lastObject;
      }
    }
  }

  async getReverseSortedDocumentVersions() {
    const reversed = [];
    if (this.mySortedDocuments) {
      this.mySortedDocuments.map((item) => {
        reversed.push(item);
      });
      reversed.reverse();
      this.reverseSortedDocumentVersions = reversed;
    }
  }

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkDocumentVersions(documentVersions, model) {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'decision'].includes(modelName)) {
      return model;
    }
    const agendaActivity = await model.get('agendaActivity'); // when model = agendaitem
    const agendaitemsOnDesignAgenda = await model.get('agendaitemsOnDesignAgendaToEdit'); // when model = subcase
    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      await this.unlinkDocumentVersionsFromModel(subcase, documentVersions);
    } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
      await Promise.all(agendaitemsOnDesignAgenda
        .map((agendaitem) => this.unlinkDocumentVersionsFromModel(agendaitem, documentVersions)));
    }
    const unlinkDocumentVersionsFromModelPromise = await
    this.unlinkDocumentVersionsFromModel(model, documentVersions);
    return unlinkDocumentVersionsFromModelPromise;
  }

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  // eslint-disable-next-line class-methods-use-this
  async unlinkDocumentVersionsFromModel(model, documentVersions) {
    const modelDocumentVersions = await model.get('linkedDocumentVersions');
    if (modelDocumentVersions) {
      documentVersions
        .forEach((documentVersion) => modelDocumentVersions.removeObject(documentVersion));
    } else {
      model.set('linkedDocumentVersions', A([]));
    }
    const savedModalPromise = model.save();
    return savedModalPromise;
  }


  @action
  showVersions() {
    this.isShowingVersions = !this.isShowingVersions;
    if (this.isShowingVersions) {
      this.getReverseSortedDocumentVersions();
    }
  }

  @action
  cancel() {
    this.documentToDelete = null;
    this.isVerifyingUnlink = false;
  }

  @action
  async verify() {
    const {
      documentVersions,
    } = this.documentToDelete;
    await this.unlinkDocumentVersions(documentVersions, this.args.item);
    if (!this.isDestroyed) {
      this.isVerifyingUnlink = false;
    }
  }

  @action
  unlinkDocument(document) {
    this.documentToDelete = document;
    this.isVerifyingUnlink = true;
  }
}
