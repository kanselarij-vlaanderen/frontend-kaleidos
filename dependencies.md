


ember-functions-as-helper-polyfill: Probably no longer needed. is for ember <4.5
ember-in-viewport: rendering only what is in the viewport (large agendas fetch when scrolling)
ember-named-blocks-polyfill: Probably no longer needed. is for ember <3.25


ember-math-helpers: using f.e. "{{add x y}}" helper in template

ember-shiki: styleguide, the <CodeBlock>

ember-tag-input: input for numac numbers, OVRB


marked: styleguide, placing snippets (f.e. "--class-name" in a description) in a different style

tracked-built-ins: TrackedArrays etc


overrides

@appuniversum/ember-appuniversum:
package conflict, forced higher versions for ember-file-upload and tracked-built-ins (should not be breaking)

@lblod/ember-rdfa-editor:
package conflict, forced higher versions for tracked-built-ins (should not be breaking)

@ember-flatpickr:
build errors, forced higher versions for @ember/test-waiters (should not be breaking)

