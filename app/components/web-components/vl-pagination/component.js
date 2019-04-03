import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	links: null,
	total: null,
	page: null,
	size: null,
	nbOfItems: null,

	disabledNext: computed('isLastPage', function () {
		if (this.get('isLastPage')) {
			return 'disabled vl-u-text--muted';
		}
	}),

	disabledPrev: computed('isFirstPage', function () {
		if (this.get('isFirstPage')) {
			return 'disabled vl-u-text--muted';
		}
	}),

	currentPage: computed('page', {
		get() {
			const { page } = this;
			return page ? parseInt(page) + 1 : 1;
		},
		set(key, value) {
			this.set('page', value - 1);
			return value;
		}
	}),

	firstPage: computed('links', function () {
		return this.get('links.first.number') || 1;
	}),

	lastPage: computed('links', function () {
		const max = this.get('links.last.number') || -1;
		return max ? max + 1 : max;
	}),

	isFirstPage: computed('firstPage', 'currentPage', function () {
		return this.get('firstPage') == this.get('currentPage');
	}),

	isLastPage: computed('lastPage', 'currentPage', function () {
		return this.get('lastPage') == this.get('currentPage');
	}),

	hasMultiplePages: computed('lastPage', function () {
		return this.get('lastPage') > 0;
	}),

	startItem: computed('size', 'currentPage', function () {
		return this.get('size') * (this.get('currentPage') - 1) + 1;
	}),

	endItem: computed('startItem', 'nbOfItems', function () {
		const { startItem, nbOfItems } = this;
		return startItem + nbOfItems - 1;
	}),

	actions: {
		prevPage(link) {
			const { isFirstPage } = this;
			if (!isFirstPage) {
				this.set('page', link['number'] || 0);
			}
		},
		nextPage(link) {
			const { isLastPage } = this;
			if (!isLastPage) {
				this.set('page', link['number'] || 0);
			}
		}
	}
});
