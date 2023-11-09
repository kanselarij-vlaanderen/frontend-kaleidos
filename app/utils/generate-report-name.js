import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';

/**
 * Generates a report name like "VR PV 2023/01 - punt 0001" based on the meeting
 * and agendaitem data.
 *
 * @param {Agendaitem} agendaitem The agendaitem whose number and type will be
 * used to generate the report name.
 * @param {Meeting} meeting The meeting whose number will be
 * used to generate the report name.
 * @param {Number} [reportNr=1] The version number of the report, used to
 * determine the suffix (BIS, TER, etc.).
 */
export default async function generateReportName(agendaitem, meeting, reportNr=1) {
  // *note: any changes made here should also be made in the decision-report-generation service
  const meetingNumber = meeting.numberRepresentation;
  const type = await agendaitem.type;
  const agendaitemType = type.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
        ? 'mededeling' : 'punt';
  const agendaitemNumber = addLeadingZeros(agendaitem.number, 4);
  let versionSuffix = '';
  if (reportNr >= 1 && reportNr < Object.keys(CONFIG.latinAdverbialNumberals).length) {
    versionSuffix = CONFIG.latinAdverbialNumberals[reportNr].toUpperCase();
  }

  return `${meetingNumber} - ${agendaitemType} ${agendaitemNumber}${versionSuffix}`;
}
