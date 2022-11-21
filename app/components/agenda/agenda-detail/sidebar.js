import templateOnly from '@ember/component/template-only';

/**
  * @argument notaGroups: Array of AgendaitemGroup-objects
  * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
  * @argument announcements: Array of agendaitems with type announcement
  * @argument newItems: items to be marked as "new on this agenda"
  * @argument currentAgenda: the agenda that is currently open
  * @argument showModifiedOnly: if we should filter only on modified agendaitems
  * @argument toggleShowModifiedOnly: toggle the parent to set the modified filter on or off
  * @argument activeItem: the currently selected agendaitem
  */
export default templateOnly();
