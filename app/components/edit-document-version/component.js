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
      document.set('accessLevel', accessLevel);
      let documentVersions = await document.get('documentVersions');
      documentVersions.forEach(documentVersion => documentVersion.set('accessLevel', accessLevel))
    }
  }
});
