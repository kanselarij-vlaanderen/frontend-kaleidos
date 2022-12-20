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

  @belongsTo('meeting', { inverse: 'agendas', async: true }) createdFor;
  @belongsTo('agendastatus', { inverse: null }) status;
  @belongsTo('agenda', { inverse: 'previousVersion', async: true }) nextVersion; // Set in agenda-approve-service, read-only here
  @belongsTo('agenda', { inverse: 'nextVersion', async: true }) previousVersion; // Set in agenda-approve-service, read-only here

  @hasMany('agendaitem', { inverse: 'agenda', async: true }) agendaitems;

  get agendaName() {
    let prefix = this.status.get('isDesignAgenda')
      ? this.intl.t('design-agenda')
      : this.intl.t('agenda');
    let name = this.serialnumber || '';
    return `${prefix} ${name}`.trim();
  }
}
