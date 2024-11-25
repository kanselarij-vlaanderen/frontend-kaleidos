import { hasMany } from '@ember-data/model';
import Concept from './concept';
export default class DocumentType extends Concept {
  @hasMany('document-container', {inverse: 'type', async: true}) documents;
}
