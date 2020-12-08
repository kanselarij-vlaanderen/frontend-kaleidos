import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class EmailFolder extends Model {
  @attr() title;
  @attr() description;

  @hasMany('email') emails;
  // @hasMany('email-folder') folders;
}
