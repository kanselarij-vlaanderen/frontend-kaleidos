import TextArea from '@ember/component/text-area';

export default TextArea.extend({
  didRender() {
    // eslint-disable-next-line ember/no-jquery
    this.$().keypress((event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    });
  },
});
