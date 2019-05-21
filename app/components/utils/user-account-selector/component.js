import Component from '@ember/component';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';

export default Component.extend(ModelSelectorMixin, {
	modelName: "user",
	sortField: "last-name"
});
