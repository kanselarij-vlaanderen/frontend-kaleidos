import Controller from "@ember/controller";
import { computed } from "@ember/object";
import moment from "moment";
import isAuthenticatedMixin from "fe-redpencil/mixins/is-authenticated-mixin";
import { inject } from "@ember/service";
export default Controller.extend(isAuthenticatedMixin, {
  agendaService: inject(),
  sessionService: inject(),

  nearestMeeting: computed("model", async function() {
    const nearestMeeting = await this.agendaService.getClosestMeetingAndAgendaIdInTheFuture(
      moment()
        .utc()
        .toDate()
    );
    const meetings = this.get("model");

    const nearestMeetingInModel = meetings.find((item) => item.get("id") === nearestMeeting.meeting_id);
    if (nearestMeetingInModel) {
      nearestMeetingInModel.set("isNearest", true);
      return [nearestMeetingInModel];
    } else {
      return [this.store.findRecord("meeting", nearestMeeting.meeting_id)];
    }
  }),

  futureMeetings: computed("model", "nearestMeeting", function() {
    const meetings = this.get("model");
    const nearestMeetingDate = moment(this.get("nearestMeeting.plannedStart"))
      .utc()
      .format();
    return meetings
      .filter((meeting) => {
        let date = moment(meeting.plannedStart)
          .utc()
          .format();

        if (date > nearestMeetingDate) {
          if (this.page === 0) {
            const found = meetings.find((meetingToCheck) => meetingToCheck.get("id") === meeting.get("id"));
            if (found) {
              found.set("alreadyShown", true);
            }
          }
          if (!meeting.get("isNearest")) {
            return meeting;
          }
        }
      })
      .sortBy("plannedStart");
  }),
});
