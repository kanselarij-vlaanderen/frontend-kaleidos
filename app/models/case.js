import DS from 'ember-data';
import { computed } from '@ember/object';
import VRDocumentName, { compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import { A } from '@ember/array';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject } from '@ember/service';

const {
  Model, attr, hasMany, belongsTo, PromiseObject,
} = DS;

export default Model.extend({
  caseService: inject(),
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),

  publicationFlow: belongsTo('publication-flow', {
    inverse: null,
  }),

  subcases: hasMany('subcase'),
  pieces: hasMany('piece'),

  sortedPieces: computed('pieces.@each.name', function() {
    return A(this.get('pieces').toArray()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  }),

  // Computed.
  hasBvr: computed('pieces.@each', async function() {
    const documentTypeBesluit = await this.store.findRecord('document-type', CONFIG.documentType.besluitVlaamseRegering.id);
    return await this.caseService.hasPieceOfType(this, documentTypeBesluit);
  }),

  hasDecreet: computed('pieces.@each', async function() {
    const documentTypeDecreet = await this.store.findRecord('document-type', CONFIG.documentType.decreet.id);
    return await this.caseService.hasPieceOfType(this, documentTypeDecreet);
  }),

  latestSubcase: computed('subcases.@each', function() {
    return PromiseObject.create({
      promise:
        this.get('subcases').then((subcases) => {
          const sortedSubcases = subcases.sortBy('created');
          return sortedSubcases.get('lastObject');
        }),
    });
  }),

  documentsAmount: computed('subcases.@each', function() {
    return this.latestSubcase.documentContainersLength();
  }),

});
