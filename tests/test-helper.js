import { setApplication } from '@ember/test-helpers';
import { setup, start } from 'ember-qunit';
import Application from 'frontend-kaleidos/app';
import config from 'frontend-kaleidos/config/environment';
import * as QUnit from 'qunit';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
