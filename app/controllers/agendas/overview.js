import Controller from "@ember/controller";
import { computed } from "@ember/object";
import moment from "moment";
import isAuthenticatedMixin from "fe-redpencil/mixins/is-authenticated-mixin";
import { inject } from "@ember/service";
export default Controller.extend(isAuthenticatedMixin, {
  agendaService: inject(),

  activeAgendas: computed("model", async function() {
    const meetings = this.get("model");
    const dateOfToday = moment().utc().subtract(5, 'days').format();
    const activeAgendas = await this.agendaService.getActiveAgendas(dateOfToday);

    return meetings.filter((meeting) => this.checkIfAgendaIsPresent(activeAgendas, meeting));
  }),

  checkIfAgendaIsPresent(activeAgendas, meeting) {
    const foundItem = activeAgendas.find((activeAgenda) => activeAgenda.meeting_id === meeting.id);

    if (!foundItem) {
      return false;
    }
    return true;
  }
});
