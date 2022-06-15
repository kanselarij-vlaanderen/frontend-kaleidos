import fetch from 'fetch';

function responseHasJson(response) {
  return response.headers.get('Content-Type').includes('json');
}

function formatErrorPayload(payload) {
  return payload.errors.map((e) => e.title).join('\n');
}

/* API: agenda-approve-service */

async function reopenMeeting(meeting) {
  const endpoint = `/meetings/${meeting.id}/reopen`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  if (responseHasJson(response)) {
    const payload = await response.json();
    if (payload.errors) {
      throw new Error(formatErrorPayload(payload));
    }
    return payload.data.id;
  }
  throw new Error(response.statusText);
}

async function approveDesignAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}/approve`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  if (responseHasJson(response)) {
    const payload = await response.json();
    if (payload.errors) {
      throw new Error(formatErrorPayload(payload));
    }
    return payload.data.id;
  }
  throw new Error(response.statusText);
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
    if (responseHasJson) {
      const payload = await response.json();
      throw new Error(formatErrorPayload(payload));
    }
    throw new Error(response.statusText);
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
  if (responseHasJson(response)) {
    const payload = await response.json();
    if (payload.errors) {
      throw new Error(formatErrorPayload(payload));
    }
    return payload.data.id;
  }
  throw new Error(response.statusText);
}

async function reopenPreviousAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}/reopen`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  if (responseHasJson(response)) {
    const payload = await response.json();
    if (payload.errors) {
      throw new Error(formatErrorPayload(payload));
    }
    return payload.data.id;
  }
  throw new Error(response.statusText);
}

async function deleteAgenda(currentAgenda) {
  const endpoint = `/agendas/${currentAgenda.id}`;
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });
  if (responseHasJson(response)) {
    const payload = await response.json();
    if (payload.errors) {
      throw new Error(formatErrorPayload(payload));
    }
    return payload.data?.id;
  }
  throw new Error(response.statusText);
}

export {
  approveDesignAgenda,
  approveAgendaAndCloseMeeting,
  closeMeeting,
  reopenMeeting,
  reopenPreviousAgenda,
  deleteAgenda,
}
