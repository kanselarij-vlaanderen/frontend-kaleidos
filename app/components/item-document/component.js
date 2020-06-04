import Component from '@ember/component';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';

export default Component.extend(MyDocumentVersions, {
  isClickable: null,
  document: null,

  actions: {
    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },
});
