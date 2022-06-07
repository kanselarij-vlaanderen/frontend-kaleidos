import fetch from 'fetch';

/* API: agenda-approve-service */

async function createNewDesignAgenda(currentMeeting) {
  const response = await fetch('/agenda-approve/createDesignAgenda', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      meetingId: currentMeeting.id,
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }

  return payload.data.id;
}

async function approveDesignAgenda(currentMeeting) {
  const response = await fetch('/agenda-approve/approveAgenda', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      meetingId: currentMeeting.id,
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }

  return payload.data.id;
}

async function approveAgendaAndCloseMeeting(currentMeeting) {
  const response = await fetch(
    '/agenda-approve/approveAgendaAndCloseMeeting',
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        meetingId: currentMeeting.id,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }
}

async function closeMeeting(currentMeeting) {
  const response = await fetch('/agenda-approve/closeMeeting', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      meetingId: currentMeeting.id,
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }

  return payload.data.id;
}

async function reopenPreviousAgenda(currentMeeting) {
  const response = await fetch('/agenda-approve/reopenPreviousAgenda', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      meetingId: currentMeeting.id,
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }

  return payload.data.id;
}

async function deleteAgenda(currentMeeting, currentAgenda) {
  const response = await fetch('/agenda-approve/deleteAgenda', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      meetingId: currentMeeting.id,
      agendaId: currentAgenda.id,
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.detail);
  }

  if (payload.data?.id) {
    return await this.store.queryOne('agenda', {
      'filter[:id:]': payload.data.id,
    });
  }
}

export {
  createNewDesignAgenda,
  approveDesignAgenda,
  approveAgendaAndCloseMeeting,
  closeMeeting,
  reopenPreviousAgenda,
  deleteAgenda,
}
