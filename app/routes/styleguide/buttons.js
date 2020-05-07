import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return [
      {
        name: "Primary",
        code: '<button class="vl-button vl-button--narrow">Button label</button>'
      },
      {
        name: "Secondary",
        code: '<button class="vl-button vl-button--secondary vl-button--narrow">Button label</button>'
      },
      {
        name: "Tertiary",
        code: '<button class="vl-button vl-button--tertiary vl-button--narrow">Button label</button>'
      },
      {
        name: "Input radio",
        code: '<label class="vl-radio">\n' +
          '    <input class="vl-radio__toggle" type="radio" name="radio-id" value="1" checked="checked" />\n' +
          '    <div class="vl-radio__label">Ja</div>\n' +
          '</label>\n' +
          '<label class="vl-radio">\n' +
          '    <input class="vl-radio__toggle" type="radio" name="radio-id" value="2" />\n' +
          '    <div class="vl-radio__label">Nee</div>\n' +
          '</label>'
      },
      {
        name: "Input checkbox",
        code: '<label class="vl-checkbox">\n' +
          '    <input class="vl-checkbox__toggle" type="checkbox" checked="checked" />\n' +
          '    <div class="vl-checkbox__label">\n' +
          '        <i class="vl-checkbox__box" aria-hidden="true"></i>Optie 1</div>\n' +
          '</label>\n' +
          '<label class="vl-checkbox">\n' +
          '    <input class="vl-checkbox__toggle" type="checkbox" />\n' +
          '    <div class="vl-checkbox__label">\n' +
          '        <i class="vl-checkbox__box" aria-hidden="true"></i>Optie 2</div>\n' +
          '</label>'
      },
      {
        name: "Input checkbox block",
        code: '<label class="vl-checkbox vl-checkbox--block">\n' +
          '    <input class="vl-checkbox__toggle" type="checkbox" />\n' +
          '    <div class="vl-checkbox__label">\n' +
          '        <i class="vl-checkbox__box" aria-hidden="true"></i>Optie 1</div>\n' +
          '</label>\n' +
          '<label class="vl-checkbox vl-checkbox--block">\n' +
          '    <input class="vl-checkbox__toggle" type="checkbox" checked="checked" />\n' +
          '    <div class="vl-checkbox__label">\n' +
          '        <i class="vl-checkbox__box" aria-hidden="true"></i>Optie 2</div>\n' +
          '</label>'
      },
    ]
  }
});
