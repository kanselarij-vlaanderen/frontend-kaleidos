import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	subcasePhases: hasMany('subcase-phase', { inverse: null }),
  subphaseCodes: hasMany('subcase-phase-code', {inverse:null}),
	superphase: belongsTo('subcase-phase-code', { inverse: null })
});
