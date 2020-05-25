import Component from '@ember/component';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import { deprecatingAlias } from '@ember/object/computed';

export default Component.extend(MyDocumentVersions, {
  isClickable: null,

  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  actions: {
    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },
});
