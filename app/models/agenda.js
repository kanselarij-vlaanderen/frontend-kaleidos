import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
// LoadableModel is still depended upon here and there. Should refactor out in the more general direction the codebase handles these load operations.
// eslint-disable-next-line ember/no-mixins
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export default class Agenda extends Model.extend(LoadableModel) {
  @service intl;

  @attr title;
  @attr serialnumber;
  @attr('datetime') issued;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('meeting') createdFor;
  @belongsTo('agendastatus', { inverse: null }) status;
  // the next and previous version of agenda is set in agenda-approve-service, read-only in frontend
  @belongsTo('agenda', {
    inverse: 'nextVersion',
    serialize: false,
  }) previousVersion;
  @belongsTo('agenda', {
    inverse: 'previousVersion',
    serialize: false,
  }) nextVersion;

  @hasMany('agendaitem', {
    inverse: null,
    serialize: false,
  }) agendaitems;

  get agendaName() {
    let prefix = this.status.get('isDesignAgenda') ? this.intl.t('design-agenda') : this.intl.t('agenda');
    let name = this.serialnumber || '';
    return `${prefix} ${name}`.trim();
  }
}
