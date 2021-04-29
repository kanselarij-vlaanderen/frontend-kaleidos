import fetch from 'fetch';
import moment from 'moment';

function registerJobToStore(job, store) {
  store.pushPayload(job);
  return store.peekRecord('file-bundling-job', job.data.id);
}

function prettifyAgendaName(agenda) {
  if (agenda.get('isDesignAgenda')) {
    return 'ontwerpagenda';
  }
  return `agenda_${agenda.serialnumber}`;
}

async function constructArchiveName(agenda) {
  const date = (await agenda.createdFor).plannedStart;
  const formattedDate = moment(date).format('DD_MM_YYYY');
  const agendaName = prettifyAgendaName(agenda);
  return `VR_zitting_${formattedDate}_${agendaName}_alle_punten.zip`;
}

async function fetchArchivingJob(agenda) {
  const url = `/agendas/${agenda.id}/agendaitems/pieces/files/archive`;
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

async function fetchArchivingJobForAgenda(agenda, store) {
  const job = await fetchArchivingJob(agenda);
  if (job) {
    return registerJobToStore(job, store);
  }
  return null;
}

async function fileDownloadUrlFromJob(job, archiveName) {
  let file = job.belongsTo('generated').value();
  if (!file) {
    await job.reload();
    file = await job.get('generated');
  }
  return `${file.downloadLink}?name=${archiveName}`;
}

export {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
};
