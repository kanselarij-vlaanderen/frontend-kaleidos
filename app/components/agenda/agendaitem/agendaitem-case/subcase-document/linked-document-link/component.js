import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import { A } from '@ember/array';
import { deprecatingAlias } from '@ember/object/computed';

export default Component.extend(MyDocumentVersions, {
  currentSession: inject(),
  classNames: ['vl-u-spacer-extended-bottom-s'],
  classNameBindings: ['aboutToDelete'],
  isShowingVersions: false,
  documentToDelete: null,

  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  openClass: computed('isShowingVersions', function () {
    if (this.get('isShowingVersions')) {
      return 'js-vl-accordion--open';
    }
  }),

  myDocumentVersions: computed.alias('item.linkedDocumentVersions'),

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkDocumentVersions(documentVersions, model) {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'decision'].includes(modelName)) {
      return model;
    }
    const subcase = await model.get('subcase');
    const agendaitemsOnDesignAgenda = await model.get('agendaitemsOnDesignAgendaToEdit');
    if (subcase) {
      await this.unlinkDocumentVersionsFromModel(subcase, documentVersions);
    } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
      await Promise.all(agendaitemsOnDesignAgenda.map(agendaitem => this.unlinkDocumentVersionsFromModel(agendaitem, documentVersions)));
    }
    return await this.unlinkDocumentVersionsFromModel(model, documentVersions);
  },

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkDocumentVersionsFromModel(model, documentVersions) {
    const modelDocumentVersions = await model.get('linkedDocumentVersions');
    if (modelDocumentVersions) {
      documentVersions.forEach(documentVersion => modelDocumentVersions.removeObject(documentVersion))
    } else {
      model.set('linkedDocumentVersions', A([]));
    }
    return await model.save();
  },

  actions: {
    showVersions() {
      this.toggleProperty('isShowingVersions');
    },

    cancel() {
      this.set('documentToDelete', null);
      this.set('isVerifyingUnlink', false);
    },

    async verify() {
      const documentVersions = await this.get('documentToDelete.documentVersions');
      await this.unlinkDocumentVersions(documentVersions, this.get('item'));
      if (!this.isDestroyed) {
        this.set('isVerifyingUnlink', false);
      }
    },

    unlinkDocument(document) {
      this.set('documentToDelete', document);
      this.set('isVerifyingUnlink', true);
    },
  },
});
