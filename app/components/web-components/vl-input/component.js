import Component from '@ember/component';

export default Component.extend({
	tagName: 'input',
	classNames: ["vl-input-field"],
	classNameBindings: ["isBlock:vl-input-field--block"],
	isBlock: false,
	value:null
});
