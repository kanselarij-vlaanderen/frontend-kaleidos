import fetch from 'fetch';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

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

async function fetchArchivingJob(agenda, mandateeIds, decisions= false, pdfOnly) {
  let url = `/agendas/${agenda.id}/agendaitems/pieces/files/archive?decisions=${decisions}&pdfOnly=${pdfOnly}`;
  if (mandateeIds.length) {
    url += '&' + (new URLSearchParams({ mandateeIds }).toString());
  }
  // This does not handle any errors send from the backend.
  const fetchedJob = await fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/vnd.api+json',
    },
  });
  if (fetchedJob.status > 201) {
    return null;
  }
  return getJsonPayloadOrThrow(fetchedJob);
}

async function fetchArchivingJobForAgenda(agenda, mandateeIds, decisions, store, pdfOnly) {
  const job = await fetchArchivingJob(agenda, mandateeIds, decisions, pdfOnly);
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

function constructGenericArchiveName(name) {
  const uniqueName = name ? `_${name}` : '';
  const formattedDate = dateFormat(new Date(), 'dd_MM_yyyy_HH_mm_ss');
  return `Kaleidos_documenten${uniqueName}_${formattedDate}.zip`;
}

async function fetchGenericArchivingJobWithPath(path, store, pdfOnly) {
  const job = await fetchGenericArchivingJob(path, pdfOnly);
  if (job) {
    return registerJobToStore(job, store);
  }
  return null;
}

async function fetchGenericArchivingJob(path, pdfOnly) {
  let url = `${path}?pdfOnly=${pdfOnly}`;
  const fetchedJob = await fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/vnd.api+json',
    },
  });
  if (fetchedJob.status > 201) {
    return null;
  }
  return getJsonPayloadOrThrow(fetchedJob);
}

export {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob,
  constructGenericArchiveName,
  fetchGenericArchivingJobWithPath
};
