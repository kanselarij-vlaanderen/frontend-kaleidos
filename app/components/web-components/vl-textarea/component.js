import Component from '@ember/component';

export default Component.extend({
	tagName: 'textarea',
	classNames:["vl-textarea"],
	classNameBindings: ["isBlock:vl-textarea--block"],
	isBlock: false,
	value:null
});
