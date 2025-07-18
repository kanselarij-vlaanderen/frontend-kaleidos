import fetch from 'fetch';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

/* API: agenda-approve-service */

async function reopenMeeting(meeting) {
  const endpoint = `/meetings/${meeting.id}/reopen`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  const payload = await getJsonPayloadOrThrow(response);
  return payload.data.id;
}

async function approveDesignAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}/approve`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  const payload = await getJsonPayloadOrThrow(response);
  return payload.data.id;
}

async function approveAgendaAndCloseMeeting(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}/close`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    await getJsonPayloadOrThrow(response);
  }
}

async function closeMeeting(currentMeeting) {
  const endpoint = `/meetings/${currentMeeting.id}/close`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  const payload = await getJsonPayloadOrThrow(response);
  return payload.data.id;
}

async function reopenPreviousAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}/reopen`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  const payload = await getJsonPayloadOrThrow(response);
  return payload.data.id;
}

async function deleteAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}`;
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  const payload = await getJsonPayloadOrThrow(response);
  return payload.data?.id;
}

export {
  approveDesignAgenda,
  approveAgendaAndCloseMeeting,
  closeMeeting,
  reopenMeeting,
  reopenPreviousAgenda,
  deleteAgenda,
}
