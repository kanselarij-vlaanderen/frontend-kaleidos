import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';

export default class PreventUnloadModifier extends Modifier {
  @service preventUnload;

  modify(_element) {
    this.preventUnload.enable();
    registerDestructor(this, this.preventUnload.disable);
  }
}