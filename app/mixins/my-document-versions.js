import Mixin from '@ember/object/mixin';
import EmberObject, { computed } from '@ember/object';

export default Mixin.create({
  lastDocumentVersion: computed('mySortedDocumentVersions', async function(){
    return (await this.get('mySortedDocumentVersions')).lastObject;
  }),

  lastDocumentVersionName: computed('lastDocumentVersion.document.name', async function(){
    const version = await this.get('lastDocumentVersion');
    const document = await version.get('document');
    return await version.get('name');
  }),

  mySortedDocumentVersions: computed('item.documentVersions.@each', 'document.sortedDocumentVersions.@each', async function(){
    const itemVersionIds = {};
    (await this.get('item.documentVersions')).map((item) => {
      itemVersionIds[item.get('id')] = true;
    });
    const documentVersions = await this.get('document.sortedDocumentVersions');

    return documentVersions.filter((item) => {
      return itemVersionIds[item.id];
    });
  }),

  myReverseSortedVersions: computed('mySortedDocumentVersions.@each', async function(){
    return (await this.get('mySortedDocumentVersions')).reverse();
  }),

  numberOfDocumentVersions: computed('mySortedDocumentVersions.@each', async function(){
    return (await this.get('mySortedDocumentVersions')).length;
  })

});
