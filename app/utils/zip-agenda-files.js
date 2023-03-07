import fetch from 'fetch';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

function registerJobToStore(job, store) {
  store.pushPayload(job);
  return store.peekRecord('file-bundling-job', job.data.id);
}

async function prettifyAgendaName(agenda) {
  const agendaStatus = await agenda.status;
  if (agendaStatus.isDesignAgenda) {
    return 'ontwerpagenda';
  }
  return `agenda_${agenda.serialnumber}`;
}

async function constructArchiveName(agenda) {
  const meeting = await agenda.createdFor;
  const formattedDate = dateFormat(meeting.plannedStart, 'dd_MM_yyyy');
  const agendaName = await prettifyAgendaName(agenda);
  return `VR_zitting_${formattedDate}_${agendaName}_alle_punten.zip`;
}

async function fetchArchivingJob(agenda, mandateeIds) {
  let url = `/agendas/${agenda.id}/agendaitems/pieces/files/archive`;
  if (mandateeIds.length) {
    url += '?' + (new URLSearchParams({ mandateeIds }).toString());
  }
  const fetchedJob = await fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/vnd.api+json',
    },
  });
  if (fetchedJob.status > 201) {
    return null;
  }
  return fetchedJob.json();
}

async function fetchArchivingJobForAgenda(agenda, mandateeIds, store) {
  const job = await fetchArchivingJob(agenda, mandateeIds);
  if (job) {
    return registerJobToStore(job, store);
  }
  return null;
}

async function fileDownloadUrlFromJob(job, archiveName) {
  let file = job.belongsTo('generated').value();
  if (!file) {
    await job.reload();
    file = await job.generated;
  }
  return `${file.downloadLink}?name=${archiveName}`;
}

export {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
};
