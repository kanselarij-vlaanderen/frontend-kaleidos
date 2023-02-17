import { belongsTo, hasMany, attr } from '@ember-data/model';
import EmberObject from '@ember/object';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class Agendaitem extends ModelWithModifier {
  @attr('number') number;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr shortTitle;
  @attr title;
  @attr formallyOk;
  @attr('boolean') isApproval; // isGoedkeuringVanDeNotulen
  @attr comment;
  @attr privateComment;


  @belongsTo('agenda', {
    inverse: null,
  }) agenda;
  // the next and previous version of agendaitem is set in agenda-approve-service, read-only in frontend
  @belongsTo('agendaitem', {
    inverse: 'previousVersion',
    serialize: false,
  }) nextVersion;
  @belongsTo('agendaitem', {
    inverse: 'nextVersion',
    serialize: false,
  }) previousVersion;
  @belongsTo('agenda-activity', {
    inverse: null,
  }) agendaActivity;
  @belongsTo('agenda-item-treatment') treatment;
  @belongsTo('concept') type;

  @hasMany('mandatee') mandatees;
  @hasMany('piece') pieces;
  @hasMany('piece') linkedPieces;

  get modelName() {
    return this.constructor.modelName;
  }

  get formallyOkToShow() {
    const options = CONFIG.formallyOkOptions;
    const foundOption = options.find((formallyOkOption) => formallyOkOption.uri === this.formallyOk);
    return EmberObject.create(foundOption);
  }
}