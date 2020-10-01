import DS from 'ember-data';

const {
  Model, attr, hasMany,
} = DS;

// TODO dit model gebruiken we niet en zou weg mogen ? zit niet in de lisp files als model
// TODO setten van confidentiality wordt gedaan met booleans, niet met dit model
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
