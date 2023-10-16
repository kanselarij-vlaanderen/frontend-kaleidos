import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * Generates a report name like "VR PV 2023/01 - punt 0001" based on the meeting
 * and agendaitem data.
 *
 * @param {Agendaitem} agendaitem The agendaitem whose number and type will be
 * used to generate the report name.
 * @param {?Meeting} [maybeMeeting=undefined] The meeting whose number will be
 * used to generate the report name. Optional, if not provided the meeting will
 * be fetched via the agendaitem.
 */
export default async function generateReportName(agendaitem, maybeMeeting = undefined) {
  let meeting = maybeMeeting;
  if (meeting === undefined) {
    const agenda = await agendaitem.agenda;
    meeting = await agenda.createdFor;
  }

  const meetingNumber = meeting.numberRepresentation;
  const type = await agendaitem.type;
  const agendaitemType = type.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
        ? 'mededeling' : 'punt';
  const agendaitemNumber = addLeadingZeros(agendaitem.number, 4);

  return `${meetingNumber} - ${agendaitemType} ${agendaitemNumber}`;
}
