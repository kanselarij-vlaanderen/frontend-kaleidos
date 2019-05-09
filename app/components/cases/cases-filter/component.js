import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-form vl-u-spacer-extended-bottom-l"],
	sizeOptions: [5, 10, 20, 50, 100, 200],
	size:null,
	
	actions: {
		selectSize(size) {
      this.set('size', size)
    }
	}
});
