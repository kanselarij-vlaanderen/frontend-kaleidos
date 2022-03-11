import Model, { attr, belongsTo } from '@ember-data/model';

export default class Account extends Model {
  @attr('string') voId;

  @belongsTo('user') user;

  /**
   * This alias is only used in one place:
   * https://github.com/lblod/ember-mock-login/blob/3aafb710617f63783343ac32eff29ddaf19b67a0/addon/components/login/each-account.hbs#L4
   * Please refrain from using it, once the usage in @lblod/ember-mock-login is removed, this alias will be removed as well.
   */
  get gebruiker() {
    return this.user;
  }
}
