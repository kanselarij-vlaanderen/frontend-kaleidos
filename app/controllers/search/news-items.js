import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import sanitizeHtml from 'sanitize-html';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class SearchNewsItemsControllers extends Controller {
  @service router;
  @service toaster;
  @service intl;

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
    },
  ];

  sortOptions = [
    { value: '-agendaitems.meetingDate', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked isLoadingModel;
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = PAGINATION_SIZES[2];
    this.sort = this.sortOptions[1].value;
  }

  get isEmptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  selectSort(event) {
    this.sort = event.target.value;
  }

  @action
  navigateToNewsletter(searchEntry) {
    const latestAgendaitem = searchEntry.latestAgendaitem;
    if (latestAgendaitem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem.news-item',
        latestAgendaitem['meetingId'],
        latestAgendaitem['agendaId'],
        latestAgendaitem['id']
      );
    }
  }

  @action
  copyText(row, event) {
    if (event) {
      event.stopPropagation();
    }

    let copyText = '';

    if (row.title) {
      copyText += `${row.title}\n\n`;
    }

    if (row.htmlContent) {
      copyText += sanitizeHtml(
        row.htmlContent
          .replace(/<p>(.*?)<\/p>/g, '$1\n\n') // Replace p-tags with \n line breaks
          .trim(), // Trim whitespaces at start & end of the string
        { allowedTags: [], allowedAttributes: {} } // Remove all remaining tags from the string
      );
    }

    navigator.clipboard.writeText(copyText);
    this.toaster.success(this.intl.t('text-copied'));
  }
}
