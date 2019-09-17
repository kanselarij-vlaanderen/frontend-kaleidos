import Mixin from '@ember/object/mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Mixin.create(isAuthenticatedMixin, {
  routeNamePrefix: null,
  modelName: 'agendaitem',
  filter: null,
  sort: null,
  page: 0,
  size: 10,
  include: null,
  shouldFilterRemarks: true,

  model() {
    const filter = {
      agenda: {
        id: this.modelFor(`print-overviews.${this.routeNamePrefix}`).get('id'),
      },
    };
    if (this.shouldFilterRemarks) {
      filter['subcase'] = {
        'show-as-remark': false,
      };
    }
    this.set('filter', filter);
    return this.store
      .query(this.get('modelName'), {
        filter,
        include: this.get('include'),
        sort: this.get('sort'),
        page: {
          size: this.get('size'),
          number: this.get('page'),
        },
      })
      .then((items) => {
        return items.toArray();
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('filter', this.filter);
    controller.set('sort', this.sort);
    controller.set('include', this.include);
  },

  redirect() {
    if (!this.editor) {
      this.transitionTo(`print-overviews.${this.routeNamePrefix}.overview`, {
        queryParams: { definite: true },
      });
    }
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
