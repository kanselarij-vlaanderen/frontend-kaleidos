## Purpose of some dependencies:

ember-functions-as-helper-polyfill: Probably no longer needed. is for ember <4.5 -- REMOVED
ember-in-viewport: rendering only what is in the viewport (large agendas fetch when scrolling)
ember-named-blocks-polyfill: Probably no longer needed. is for ember <3.25 -- REMOVED
ember-router-service-refresh-polyfill: Polyfills the RouterService#refresh method. is for ember <4.1 -- REMOVED

ember-math-helpers: using f.e. "{{add x y}}" helper in template

ember-shiki: styleguide, the <CodeBlock>

ember-tag-input: input for numac numbers, OVRB

lodash.invert: used fore inverting key-value pair object
lodash.merge: complex merge for allowedAttributes on sanitized html
marked: styleguide, placing snippets (f.e. "--class-name" in a description) in a different style
merge-anything: used in styling to merge complex styling objects

tracked-built-ins: TrackedArrays etc



## overrides

@appuniversum/ember-appuniversum:
package conflict, forced lower version of ember-concurrency since the v5 it uses is breaking (all tasks must be arrow notation)

@lblod/ember-rdfa-editor:
package conflict, forced higher versions for tracked-built-ins and ember-source (should not be breaking)

@ember-flatpickr:
build errors, forced higher versions for @ember/test-waiters (should not be breaking)
There is a new major version available that is ember v6 compatible, but requires node >= v22

ember-pdfjs-wrapper:
forced higher ember-cli-babel (not sure if this is needed)
also this is a fork since there was an error with "zlib"

