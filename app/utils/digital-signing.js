import fetch from 'fetch';

async function uploadPiecesToSigninghub(signFlows) {
  const endpoint = `/signing-flows/upload-to-signinghub`;
  const data = [];
  for (let signFlow of signFlows) {
    data.push({
      type: 'sign-flows',
      id: signFlow.id,
    });
  }
  const body = { data };
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
