import Component from '@ember/component';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';

export default Component.extend(MyDocumentVersions, {
  tagName: "tr",
  actions: {

    deleteRow(document) {
      document.set('deleted', true);
    },
    chooseDocumentType(document, type) {
      document.set('type', type);
    },

    async chooseAccessLevel(document, accessLevel) {
      let documentVersion = await document.get('lastDocumentVersion');
      documentVersion.set('accessLevel', accessLevel);
    }
  }
});
