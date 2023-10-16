async function generateDecisionReport(reportId) {
  const response = await fetch(`/generate-decision-report/${reportId}`);
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Backend response contained an error (status: ${response.status}): ${JSON.stringify(data)}`
      );
    }
    return data
  } catch (error) {
    // Errors returned from services *should* still
    // be valid JSON(:API), but we could encounter
    // non-JSON if e.g. a service is down. If so,
    // throw a nice error that only contains the
    // response status.
    if (error instanceof SyntaxError) {
      throw new Error(
        `Backend response contained an error (status: ${response.status})`
      );
    } else {
      throw error;
    }
  }
}

async function generateMinutes(minutesId) {
  const response = await fetch(`/generate-minutes-report/${minutesId}`);
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Backend response contained an error (status: ${response.status}): ${JSON.stringify(data)}`
      );
    }
    return data
  } catch (error) {
    // Errors returned from services *should* still
    // be valid JSON(:API), but we could encounter
    // non-JSON if e.g. a service is down. If so,
    // throw a nice error that only contains the
    // response status.
    if (error instanceof SyntaxError) {
      throw new Error(
        `Backend response contained an error (status: ${response.status})`
      );
    } else {
      throw error;
    }
  }
}

export {
  generateDecisionReport,
  generateMinutes,
}
