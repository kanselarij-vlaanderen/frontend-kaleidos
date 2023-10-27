import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * Generates a report name like "VR PV 2023/01 - punt 0001" based on the meeting
 * and agendaitem data.
 *
 * @param {Agendaitem} agendaitem The agendaitem whose number and type will be
 * used to generate the report name.
 * @param {Meeting} [meeting] The meeting whose number will be
 * used to generate the report name.
 */
export default async function generateReportName(agendaitem, meeting) {
  // *note: any changes made here should also be made in the decision-report-generation service
  const meetingNumber = meeting.numberRepresentation;
  const type = await agendaitem.type;
  const agendaitemType = type.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
        ? 'mededeling' : 'punt';
  const agendaitemNumber = addLeadingZeros(agendaitem.number, 4);

  return `${meetingNumber} - ${agendaitemType} ${agendaitemNumber}`;
}
