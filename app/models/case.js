import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import VRDocumentName, {
  compareFunction,
} from 'frontend-kaleidos/utils/vr-document-name';
import { A } from '@ember/array';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),

  publicationFlows: hasMany('publication-flow'),
  subcases: hasMany('subcase'),
  pieces: hasMany('piece'),
  signFlows: hasMany('sign-flow'),

  sortedPieces: computed('pieces.@each.name', function () {
    return A(this.get('pieces').toArray()).sort((pieceA, pieceB) =>
      compareFunction(
        new VRDocumentName(pieceA.get('name')),
        new VRDocumentName(pieceB.get('name'))
      )
    );
  }),
});
