import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import moment from 'moment';

export default Controller.extend(DefaultQueryParamsMixin,isAuthenticatedMixin, {
	sessionService: inject(),
  intl: inject(),
	agendaService: inject(),

	queryParams: ['from', 'to'],
	dateFilter: '',
	
	dateRegex: /^(?:(\d{1,2})-)?(?:(\d{1,2})-)?(\d{4})$/,

  sort: '-planned-start',
	size: 10,
	
	actions: {
		setDateFilter(date) {
      date = date.split('/').join('-');
      const match = this.dateRegex.exec(date);
      if (!match) {
        this.set('from', undefined);
        this.set('to', undefined);
        return;
      }
      const min = moment(parseInt(match[3]), 'YYYY', true);
      let unitToAdd;
      if (match[1] && match[2]) {
        unitToAdd = 'day';
        min.set('date', parseInt(match[1]));
        min.set('month', parseInt(match[2]) - 1); // Count starts from 0
      } else if (match[1]) {
        unitToAdd = 'month';
        min.set('month', parseInt(match[1]) - 1);
      } else {
        unitToAdd = 'year';
      }
      const max = min.clone().add(1, unitToAdd + 's');
      
      this.set('from', min.format('YYYY-MM-DD'));
      this.set('to', max.format('YYYY-MM-DD'));
      this.set('page', 0);
    },

    onClickRow(meeting) {
      this.transitionToRoute("agenda.agendaitems", meeting.id);
    }
	}

});
