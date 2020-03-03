import fetch from 'fetch';
import moment from 'moment';

function prettifyAgendaName (name) {
  if (name === 'Ontwerpagenda') {
    return 'ontwerpagenda';
  } else {
    return `agenda_${name}`;
  }
}

async function constructArchiveName (agenda) {
  const date = await agenda.get('createdFor.plannedStart');
  const formattedDate = moment(date).format('DD_MM_YYYY');
  const agendaName = prettifyAgendaName(agenda.name);
  return `VR_zitting_${formattedDate}_${agendaName}_alle_punten.zip`
}

async function fetchFilesOfAgenda (agenda) {
  const url = `/agendas/${agenda.id}/agendaitems/documents`;
  const documents = (await (await fetch(url, {
    headers: { 'Content-type': 'application/vnd.api+json' }
  })).json());
  return documents.data.map((doc) => {
    // Match 'files' included in the JSONAPI payload to their 'documents'
    const file = documents.included.filter((file) => {
      return file.type === 'files' &&
        file.id === doc.relationships.file.data.id;
    })[0];
    // JSONAPI objects with constructed filenames for the files in the archive
    return {
      type: 'files',
      id: file.id,
      attributes: {
        name: doc.attributes.name + '.' + file.attributes.extension
      }
    }
  })
}

async function fetchArchivingJob (files, archiveName) {
  const url = `/files/archive?name=${archiveName}`;
  let job = (await fetch(url, {
    method: 'post',
    headers: { 'Content-type': 'application/vnd.api+json' },
    body: JSON.stringify({
      data: files
    })
  })).json();
  return job;
}

async function fetchArchivingJobForAgenda (agenda, store) {
  const namePromise = await constructArchiveName(agenda);
  const filesPromise = await fetchFilesOfAgenda(agenda);
  const [name, files] = await Promise.all([namePromise, filesPromise]);
  let job = await fetchArchivingJob(files, name);
  job = registerJobToStore(job, store);
  return job;
}

function registerJobToStore (job, store) {
  store.pushPayload(job);
  return store.peekRecord('file-bundling-job', job.data.id);
}

async function fileDownloadUrlFromJob (job, archiveName) {
  let file = job.belongsTo('generated').value();
  if (!file) {
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
