import Model, { attr, hasMany } from '@ember-data/model';

export default class EmailFolder extends Model {
  @attr() title;
  @attr() description;

  @hasMany('email', { inverse: 'folder', async: true }) emails;
  // @hasMany('mail-folder') folders;
}
