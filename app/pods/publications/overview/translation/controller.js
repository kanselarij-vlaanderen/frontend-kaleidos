import AbstractPublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'isUrgent',
  'publicationNumber',
  'shortTitle',
  'pageCount',
  'translationRequestDate',
  'translationDueDate',
  'publicationDueDate',
];

export default class PublicationsOverviewTranslationController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'translation';
}
