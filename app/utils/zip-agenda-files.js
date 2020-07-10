import fetch from 'fetch';
import moment from 'moment';

function prettifyAgendaName(agenda) {
  if (agenda.get('isDesignAgenda')) {
    return 'ontwerpagenda';
  } else {
    return `agenda_${agenda.serialnumber}`;
  }
}

async function constructArchiveName(agenda) {
  const date = await agenda.get('createdFor.plannedStart');
  const formattedDate = moment(date).format('DD_MM_YYYY');
  const agendaName = prettifyAgendaName(agenda);
  return `VR_zitting_${formattedDate}_${agendaName}_alle_punten.zip`
}

async function fetchArchivingJob(agenda) {
  const url = `/agendas/${agenda.id}/agendaitems/documents/files/archive`;
  return await fetch(url, {
    method: 'post',
    headers: { 'Content-type': 'application/vnd.api+json' }
  }).then((fetchedJob) => {
    if (fetchedJob.status > 201) {
      alert('De vergadering heeft geen documenten om te zippen.');
      return null;
    }
    return fetchedJob.json();
  }).catch((error) => {
    return null;
  });

}

async function fetchArchivingJobForAgenda(agenda, store) {
  let job = await fetchArchivingJob(agenda);
  if (job) {
    return registerJobToStore(job, store);
  }
  return null;
}

function registerJobToStore(job, store) {
  store.pushPayload(job);
  return store.peekRecord('file-bundling-job', job.data.id);
}

async function fileDownloadUrlFromJob(job, archiveName) {
  let file = job.belongsTo('generated').value();
  if (!file) {
    await job.reload();
    file = await job.get('generated');
  }
  const url = `${file.downloadLink}?name=${archiveName}`;
  return url;
}

export {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
};
