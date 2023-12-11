import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class CasesCaseSubcasesDemoSubcaseDemoController extends Controller {
  @service router;
  @tracked decisionmakingFlow;
  @tracked siblingSubcasesCount;
  @tracked currentRoute = this.router.currentRouteName;

  constructor() {
    super(...arguments);
    this.router.on('routeDidChange', () => {
      this.currentRoute = this.router.currentRouteName;
    });
  }

  @action
  refreshSubcases() {
    this.router.refresh('cases.case.subcases-demo');
  }

  @task
  *saveCase(_case) {
    yield _case.save();
  }

  setupController(controller) {
    super.setupController(controller);

    // Scroll observer for nav
    controller.observer = null;

    controller.initializeObserver = function() {
      const scrollableDiv = document.querySelector('.js-subcase-nav-observer');
      this.observer = new IntersectionObserver(this.handleIntersect.bind(this), { root: scrollableDiv, threshold: 0.1 });
      document.querySelectorAll('.js-subcase-nav-observer').forEach(element => {
        this.observer.observe(element);
      });
    };

    controller.initializeAnchors = function() {
      // Add click event listener to anchor links
      document.querySelectorAll('a.js-anchor[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
          // Remove 'active' class from all anchor links
          document.querySelectorAll('a.js-anchor[href^="#"]').forEach(anchor => {
            anchor.classList.remove('active');
          });

          // Add 'active' class to clicked anchor link
          event.currentTarget.classList.add('active');
        });
      });
    };

    controller.handleIntersect = action(function(entries) {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const correspondingAnchor = document.querySelector(`a.js-anchor[href="#${id}"]`);
  
        if (entry.isIntersecting) {
          correspondingAnchor.classList.add('active');
        } else {
          correspondingAnchor.classList.remove('active');
        }
      });
    });

    controller.reinitialize = action(function() {
      // Disconnect the old observer
      this.observer.disconnect();

      // Initialize observer and anchors again
      this.initializeObserver();
      this.initializeAnchors();
    });

    // Call the initialization methods
    controller.initializeObserver();
    controller.initializeAnchors();
  }
}
