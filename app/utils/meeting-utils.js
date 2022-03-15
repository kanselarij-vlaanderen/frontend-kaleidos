// TODO once codelists are correctly used in the frontend
// we should check whether kindUri has a broader type 'Annex'
export const isAnnexMeetingKind = function (kindUri) {
  return (
    kindUri ===
    'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/1d16cb70-0ae9-489e-bf97-c74897222e3c'
  );
};

export const fetchClosestMeetingAndAgendaId = async function (date) {
  const response = await fetch(`/session-service/closestMeeting?date=${date}`, {
    method: 'GET',
  });
  const json = await response.json();
  return json.body.closestMeeting;
};

export const assignNewSessionNumbers = async function () {
  const response = await fetch('/session-service/assignNewSessionNumbers', {
    method: 'GET',
  });
  return response;
};
