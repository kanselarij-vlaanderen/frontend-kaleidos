/* eslint-disable class-methods-use-this */
import Route from '@ember/routing/route';
import { isEmpty, isPresent } from '@ember/utils';
import moment from 'moment';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import { inject as service } from '@ember/service';

export default class NewsletterInfosSearchRoute extends Route {
  @service metrics;
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  textSearchFields = Object.freeze(['title', 'subTitle', 'richtext']);

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  postProcessAgendaitems(newsletter) {
    const agendaitems = newsletter.attributes.agendaitems;
    if (agendaitems) {
      if (Array.isArray(agendaitems)) {
        for (const agendaitem of agendaitems) {
          if (agendaitem['nextVersionId'] == null) {
            // there is no next version = latest agendaitem
            newsletter.attributes.latestAgendaitem = agendaitem;
            return;
          }
        }
      }
      newsletter.attributes.latestAgendaitem = agendaitems;
    }
  }

  postProcessDecisions(newsletter) {
    const decisions = newsletter.attributes.decisions;
    if (decisions) {
      if (Array.isArray(decisions)) {
        // TODO for now, if there are multiple decisions, we just grab the first one
        newsletter.attributes.decision = decisions.firstObject;
        return;
      }
      newsletter.attributes.decision = decisions;
    }
  }

  postProcessMandatees(newsletter) {
    const mandatees = newsletter.attributes.latestAgendaitem.mandatees;
    if (mandatees) {
      if (Array.isArray(mandatees)) {
        const sortedMandatees = mandatees.sortBy('priority');
        newsletter.attributes.mandatees = sortedMandatees;
        return;
      }
      newsletter.attributes.mandatees = [mandatees];
    }
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams }; // eslint-disable-line
    if (!params.dateFrom) {
      params.dateFrom = null;
    }
    if (!params.dateTo) {
      params.dateTo = null;
    }
    if (!params.mandatees) {
      params.mandatees = null;
    }
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = params.searchText;
    }
    if (!isEmpty(params.mandatees)) {
      filter[
        'agendaitems.mandatees.firstName,agendaitems.mandatees.familyName'
      ] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      const to = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte,gte:agendaitems.meetingDate'] = [
        to.utc().toISOString(),
        from.utc().toISOString(),
      ].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      filter[':gte:agendaitems.meetingDate'] = date.utc().toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte:agendaitems.meetingDate'] = date.utc().toISOString();
    }

    // filter out newsletters that are general newsletters
    filter[':has-no:generalNewsletterMeetingId'] = 't';
    // filter out newsletters that are not linked to a meeting via treatment(s)/agendaitem(s)
    filter[':has:agendaitems'] = 't';

    this.lastParams.commit();
    if (isEmpty(params.searchText)) {
      return [];
    }
    return search(
      'newsletter-infos',
      params.page,
      params.size,
      params.sort,
      filter,
      (newsletters) => {
        const entry = newsletters.attributes;
        entry.id = newsletters.id;
        this.postProcessAgendaitems(newsletters);
        this.postProcessDecisions(newsletters);
        this.postProcessMandatees(newsletters);
        return entry;
      }
    );
  }

  afterModel(model) {
    const keyword = this.paramsFor('search').searchText;
    let count;
    if (model && model.meta && isPresent(model.meta.count)) {
      count = model.meta.count;
    } else {
      count = false;
    }
    this.metrics.invoke('trackSiteSearch', {
      keyword,
      category: 'newslettersSearch',
      searchCount: count,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.emptySearch = isEmpty(this.paramsFor('search').searchText);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }
}
