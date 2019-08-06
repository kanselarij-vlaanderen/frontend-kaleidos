import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {

});
