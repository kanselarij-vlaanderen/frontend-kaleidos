import Component from '@ember/component';
import LightTableMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';
import $ from 'jquery';

export default Component.extend(LightTableMixin, {
  classNames: ['container-flex'],
  modelName: 'agendaitem',
  isScrolling: false,

  didInsertElement: function() {
    this._super(...arguments);
  }
});
