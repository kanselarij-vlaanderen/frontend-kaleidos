import fetch from 'fetch';

async function uploadPiecesToSigninghub(signingFlow, pieces) {
  const endpoint = `/signing-flows/${signingFlow.id}/upload-to-signinghub`;
  const data = [];
  for (const piece of pieces) {
    data.push({
      type: 'pieces',
      id: piece.id
    });
  }
  const body = { data: data };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    },
    body: JSON.stringify(body),
  };
  const res = await fetch(endpoint, options);
  return res
}

async function startSigning(signingFlow) {
  const endpoint = `/signing-flows/${signingFlow.id}/start`;
  const options = {
    method: 'POST',
  };
  const res = await fetch(endpoint, options);
  return res;
}

export {
  uploadPiecesToSigninghub,
  startSigning
};
