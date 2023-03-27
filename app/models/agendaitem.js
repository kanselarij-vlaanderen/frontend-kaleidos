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

  @belongsTo('agenda', { inverse: 'agendaitems', async: true }) agenda;
  @belongsTo('agendaitem', { inverse: 'previousVersion', async: true })
  nextVersion; // Set in agenda-approve-service, read-only here
  @belongsTo('agendaitem', { inverse: 'nextVersion', async: true })
  previousVersion; // Set in agenda-approve-service, read-only here
  @belongsTo('agenda-activity', { inverse: 'agendaitems', async: true })
  agendaActivity;
  @belongsTo('agenda-item-treatment', { inverse: 'agendaitems', async: true })
  treatment;
  @belongsTo('concept', { inverse: null, async: true }) type;

  @hasMany('mandatee', { inverse: 'agendaitems', async: true }) mandatees;
  @hasMany('piece', { inverse: 'agendaitems', async: true }) pieces;
  @hasMany('piece', {
    inverse: 'linkedAgendaitems',
    async: true,
    polymorphic: true,
  })
  linkedPieces;

  get modelName() {
    return this.constructor.modelName;
  }

  get formallyOkToShow() {
    const options = CONFIG.formallyOkOptions;
    const foundOption = options.find(
      (formallyOkOption) => formallyOkOption.uri === this.formallyOk
    );
    return EmberObject.create(foundOption);
  }
}
