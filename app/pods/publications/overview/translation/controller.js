import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'isUrgent',
  'publicationNumber',
  'shortTitle',
  'pageCount',
  'translationRequestDate',
  'translationDueDate',
  'publicationDueDate',
];

export default class PublicationsOverviewTranslationController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'translation';
}
