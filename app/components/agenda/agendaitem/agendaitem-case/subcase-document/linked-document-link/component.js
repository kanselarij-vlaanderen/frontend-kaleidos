import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import DS from 'ember-data';

export default Component.extend({
  currentSession: inject(),
  classNames: ['vl-u-spacer-extended-bottom-s'],
  classNameBindings: ['aboutToDelete'],
  isShowingVersions: false,
  documentToDelete: null,
  document: null,
  openClass: computed('isShowingVersions', function () {
    if (this.get('isShowingVersions')) {
      return 'js-vl-accordion--open';
    }
    return null;
  }),

  myDocumentVersions: computed.alias('item.linkedDocumentVersions'),

  lastDocumentVersion: computed('mySortedDocumentVersions.@each', function () {
    const sortedVersions = this.get('mySortedDocumentVersions');
    return sortedVersions.lastObject;
  }),


  lastDocumentVersionName: computed('lastDocumentVersion.name', function () {
    return this.get('lastDocumentVersion.name');
  }),

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-document-version/component.js
  mySortedDocumentVersions: computed('myDocumentVersions.@each', 'document.sortedDocumentVersions.@each', function () {
    return DS.PromiseArray.create({
      promise: (async () => {
        const itemVersionIds = {};
        const versions = await this.get('myDocumentVersions');
        if (versions) {
          versions.map((item) => {
            itemVersionIds[item.get('id')] = true;
          });
        }
        const documentVersions = await this.get('document.sortedDocumentVersions');
        if (documentVersions) {
          const matchingVersions = await documentVersions.filter((item) => {
            return itemVersionIds[item.id];
          });
          return matchingVersions;
        }
      })()
    });
  }),

  myReverseSortedVersions: computed('mySortedDocumentVersions.@each', function () {
    const reversed = [];
    this.get('mySortedDocumentVersions').map((item) => {
      reversed.push(item);
    });
    reversed.reverse();
    return reversed;
  }),

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
