import fetch from 'fetch';

export const fetchClosestMeetingAndAgendaId = async function (date) {
  const response = await fetch(`/session-number/closestMeeting?date=${date}`, {
    method: 'GET',
  });
  const payload = await response.json();
  return payload.body.closestMeeting;
};

export const assignNewSessionNumbers = async function () {
  const response = await fetch('/session-number/assignNewSessionNumbers', {
    method: 'GET',
  });
  return response;
};
