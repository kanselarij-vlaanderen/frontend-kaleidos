import DS from "ember-data";
import { computed } from "@ember/object";
import CONFIG from "fe-redpencil/utils/config";

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  name: attr("string"),
  issued: attr("date"),
  createdFor: belongsTo("meeting"),
  agendaitems: hasMany("agendaitem", { inverse: null, serialize: false }),
  created: attr("date"),
  isAccepted: attr("boolean"),
  modified: attr("date"),

  isDesignAgenda: computed('name', function() {
    return this.name == "Ontwerpagenda";
  }),

  agendaName: computed("name", function() {
    if (this.get("name.length") > 2) {
      return this.name;
    } else {
      return "Agenda " + this.name;
    }
  }),

  isApprovable: computed("agendaitems.@each", function() {
    return this.get("agendaitems").then(agendaitems => {
      const approvedAgendaItems = agendaitems.filter(agendaitem =>
        this.checkFormallyOkStatus(agendaitem)
      );
      return approvedAgendaItems.get("length") === agendaitems.get("length");
    });
  }),

  checkFormallyOkStatus(agendaitem) {
    const formallyOkStatus = agendaitem.get("formallyOk");
    if (formallyOkStatus == CONFIG.formallyOk) {
      return true;
    }

    if (formallyOkStatus == CONFIG.formallyNok) {
      return true;
    }

    return false;
  }
});
