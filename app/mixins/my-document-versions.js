import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Mixin.create({
  myDocumentVersions: computed.alias('item.documentVersions'),

  lastDocumentVersion: computed('mySortedDocumentVersions.@each', function(){
    const sortedVersions = this.get('mySortedDocumentVersions');
    return sortedVersions.lastObject;
  }),

  lastDocumentVersionName: computed('lastDocumentVersion.document.name', function(){
    const version = this.get('lastDocumentVersion');
    if(!version){
      return null;
    }
    // const document = version.get('document');
    return version.get('name');
  }),

  mySortedDocumentVersions: computed('myDocumentVersions.@each', 'document.sortedDocumentVersions.@each', function(){
    return DS.PromiseArray.create({
      promise: (async () => {
        const itemVersionIds = {};
        (await this.get('myDocumentVersions')).map((item) => {
          itemVersionIds[item.get('id')] = true;
        });
        const documentVersions = await this.get('document.sortedDocumentVersions');

        const matchingVersions = await documentVersions.filter((item) => {
          return itemVersionIds[item.id];
        });
        return matchingVersions;
      })()
    });
  }),

  myReverseSortedVersions: computed('mySortedDocumentVersions.@each', function(){
    const reversed = [];
    this.get('mySortedDocumentVersions').map((item) => {
      reversed.push(item);
    });
    reversed.reverse();
    return reversed;
  }),

  numberOfDocumentVersions: computed('mySortedDocumentVersions.@each', function(){
    return this.get('mySortedDocumentVersions').length;
  })

});
