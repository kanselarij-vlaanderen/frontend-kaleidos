import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend(isAuthenticatedMixin, UploadDocumentMixin, MyDocumentVersions, {
  globalError: inject(),
  fileService: inject(),
  intl: inject(),
  classNames: ['vl-u-spacer-extended-bottom-s'],
  classNameBindings: ['aboutToDelete'],
  isShowingVersions: false,
  isUploadingNewVersion: false,
  uploadedFile: null,
  isEditing: false,
  documentToDelete: null,

  isSubcase: computed('item.contructor', function () {
		const { item } = this;
		return item.get('modelName') === 'subcase';
	}),

  aboutToDelete: computed('document.aboutToDelete', function() {
    if (this.document) {
      if (this.document.get('aboutToDelete')) {
        return 'deleted-state';
      }
    }
  }),

  openClass: computed('isShowingVersions', function() {
    if (this.get('isShowingVersions')) {
      return 'js-vl-accordion--open';
    }
  }),

  async resetFormallyOk() {
    const doc = await this.get('document');
    const subcases = await Promise.all(doc.get('documentVersions').map(docVer => docVer.subcase));

    const agendaitemsOnDesignAgendas = await Promise.all(subcases.filter(subcase => !!subcase).map(subcase => subcase.agendaitemsOnDesignAgendaToEdit))
      .then(agendaItemArrays => agendaItemArrays.reduce((prev, curr) => prev.concat(curr.toArray()), []));

    await Promise.all(agendaitemsOnDesignAgendas
      .map(async agendaitem => {
        agendaitem.set('formallyOk', CONFIG.notYetFormallyOk);
        const approvals = await agendaitem.get('approvals');
        await Promise.all(approvals.map(approval =>  approval.destroyRecord()));
        agendaitem.save();
      }))
  },

  async deleteUploadedDocument() {
    const uploadedFile = this.get('uploadedFile');
    if (uploadedFile && uploadedFile.id) {
      const versionInCreation = await uploadedFile.get('documentVersion');
      if (versionInCreation) {
        await this.fileService.deleteDocumentVersion(versionInCreation);
      } else {
        await this.fileService.removeFile(uploadedFile.id);
      }
      this.set('uploadedFile', null);
    }
  },

  actions: {
    showVersions() {
      this.toggleProperty('isShowingVersions');
    },

    async delete() {
      this.deleteUploadedDocument();
    },

    async saveChanges() {
      await this.document.save();
      this.set('isEditing', false);
    },

    async cancelChanges(){
      await this.document.rollbackAttributes();
      this.set('isEditing', false);
    },

    add(file) {
      this.set('uploadedFile', file);
      this.send('uploadedFile', file);
    },

    async openUploadDialog() {
      this.toggleProperty('isUploadingNewVersion');
    },

    async closeUploadDialog() {
      this.deleteUploadedDocument();
      this.toggleProperty('isUploadingNewVersion');
    },

    toggleIsEditing() {
      if(!this.isEditor){
        return;
      }
      this.toggleProperty('isEditing');
    },

    async saveDocuments() {
      this.set('isLoading', true);
      const documentVersion = await this.get('document.lastDocumentVersion');
      await documentVersion.save();
      const item = await this.get('item');
      const itemType = item.get('constructor.modelName');
      const subcase = await item.get('subcase');
      const { isSubcase } = this;
      const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');

      if (itemType !== "decision" && subcase) {
        await this.attachDocumentVersionsToModel([documentVersion], subcase).then(item => item.save());
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.addDocumentVersionsToAgendaitems([documentVersion], agendaitemsOnDesignAgenda);
      }
      await this.attachDocumentVersionsToModel([documentVersion], item);

      await item.save().then(() => {
        if(subcase || isSubcase) this.resetFormallyOk();
      });
      if(!this.isDestroyed){
        this.set('isLoading', false);
        this.set('isUploadingNewVersion', false);
      }

    },

    cancel() {
      this.set('documentToDelete', null);
      this.set('isVerifyingDelete', false);
    },

    verify() {
      this.globalError.showToast.perform(
        EmberObject.create({
          title: this.intl.t('warning-title'),
          message: this.intl.t('document-being-deleted'),
          type: 'warning-undo',
          modelIdToDelete: this.documentToDelete.get('id'),
        })
      );
      this.deleteDocumentWithUndo();
      this.set('isVerifyingDelete', false);
      this.set('documentToDelete', null);
    },

    deleteDocument(document) {
      this.set('documentToDelete', document);
      this.set('isVerifyingDelete', true);
    },

    async toggleConfidential() {

    },
  },

  async deleteDocumentWithUndo() {
    const { item } = this;
    const documentVersions = item.get('documentVersions');
    await this.fileService.get('deleteDocumentWithUndo').perform(this.documentToDelete).then(() => {
      if(!item.aboutToDelete && documentVersions) {
        item.hasMany('documentVersions').reload();
      }
    });
  },

  async addDocumentVersionsToAgendaitems(documentVersions, agendaitems) {
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        await this.attachDocumentVersionsToModel(documentVersions, agendaitem);
        return await agendaitem.save();
      })
    );
  },
});
