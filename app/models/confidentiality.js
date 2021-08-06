import Model, { hasMany, attr } from '@ember-data/model';

// TODO dit model gebruiken we niet en zou weg mogen ? zit niet in de lisp files als model
// TODO setten van confidentiality wordt gedaan met booleans, niet met dit model
// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  subcases: hasMany('subcase', {
    inverse: null,
  }),
  documentContainers: hasMany('document-container', {
    inverse: null,
  }),
});
