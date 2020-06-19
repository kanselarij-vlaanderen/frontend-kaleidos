import TextArea from '@ember/component/text-area';

export default TextArea.extend({
  didRender() {
    this.$().keypress(function (event) {
      if (event.keyCode == 13) {
        event.preventDefault();
      }
    });
  }
});
