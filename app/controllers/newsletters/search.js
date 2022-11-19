import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import formatDate from '../../utils/format-date-search-param';
import sanitizeHtml from 'ember-cli-sanitize-html';

export default class NewsletterInfosSearchController extends Controller {
  @service router;
  @service toaster;
  @service intl;

  queryParams = {
    searchText: {
      type: 'string',
    },
    mandatees: {
      type: 'string',
    },
    dateFrom: {
      type: 'string',
    },
    dateTo: {
      type: 'string',
    },
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;
  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked isLoadingModel;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-agendaitems.meetingDate';
  }

  get isEmptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  search(e) {
    e.preventDefault();
    this.searchText = this.searchTextBuffer;
    this.mandatees = this.mandateesBuffer;
    this.dateFrom = formatDate(this.dateFromBuffer);
    this.dateTo = formatDate(this.dateToBuffer);
  }

  @action
  selectSize(size) {
    this.size = size;
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

    copyText +=
      sanitizeHtml(
        row.richtext
          .replace(/<p>(.*?)<\/p>/g, '$1\n\n') // Replace p-tags with \n line breaks
          .trim() // Trim whitespaces at start & end of the string
        , {allowedTags: [], allowedAttributes: {}} // Remove all remaining tags from the string
      );

    navigator.clipboard.writeText(copyText);
    this.toaster.success(this.intl.t('text-copied'));
  }
}
