export const fetchClosestMeetingAndAgendaId = async function (date) {
  const response = await fetch(`/session-service/closestMeeting?date=${date}`, {
    method: 'GET',
  });
  const payload = await response.json();
  return payload.body.closestMeeting;
};

export const assignNewSessionNumbers = async function () {
  const response = await fetch('/session-service/assignNewSessionNumbers', {
    method: 'GET',
  });
  return response;
};
