import Component from '@ember/component';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Component.extend(DefaultQueryParamsMixin, {
	classNames: ["cases--content-tile"]
});
