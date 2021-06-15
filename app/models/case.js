import DS from 'ember-data';
import { computed } from '@ember/object';
import VRDocumentName, { compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import { A } from '@ember/array';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject } from '@ember/service';

const {
  Model, attr, hasMany, PromiseObject,
} = DS;

export default Model.extend({
  caseService: inject(),
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),

  publicationFlows: hasMany('publication-flow'),
  subcases: hasMany('subcase'),
  pieces: hasMany('piece'),

  sortedPieces: computed('pieces.@each.name', function() {
    return A(this.get('pieces').toArray()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  }),

  // Computed.
  hasBvr: computed('pieces.@each', async function() {
    const documentTypeBesluit = await this.store.findRecordByUri('document-type', CONSTANTS.DOCUMENT_TYPES.DECISION_VR);
    return await this.caseService.hasPieceOfType(this, documentTypeBesluit);
  }),

  hasDecreet: computed('pieces.@each', async function() {
    const documentTypeDecreet = await this.store.findRecordByUri('document-type', CONSTANTS.DOCUMENT_TYPES.DECREET);
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

});
