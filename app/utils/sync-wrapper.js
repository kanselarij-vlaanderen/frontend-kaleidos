/**
 * @description resolves specified relationships, to be able to use them in `get`ters (where await is not allowed)
 * @example
 * <pre><code>await wrap(signFlow, { signSubcase: {} }) ->  loads the signSubcase</code></pre>
 * @example nested
 * <pre>await wrap(signFlow, { signSubcase: { signMarkingActivity: {} }})</code></pre>
 *
 * @typedef {{ [rel: string]: tRelGraph|[tRelGraph]}} tRelGraph
 *
 * @param {Model} model
 * @param {tRelGraph} relGraph
 * @returns
 */
export default async function wrap(model, relGraph) {
  let wrappedModel = {}
  for (let rel in relGraph) {
    let subRelGraph = relGraph[rel];
    const relModel = await model[rel];
    if (Array.isArray(subRelGraph)) {
      subRelGraph = subRelGraph[0]
      const relModels = await relModel;
      const wrappedSubModels = {}
      Reflect.setPrototypeOf(wrappedSubModels, relModels);
      for (let i = 0; i < relModels.length; ++i) {
        const relModel = relModels.objectAt(i);
        const wrappedSubModel = await wrap(relModel, subRelGraph);
        wrappedSubModels[i] = wrappedSubModel;
      }
      wrappedModel[rel] = wrappedSubModels;
    } else {
      const subRelGraph = relGraph[rel];
      if (relModel) {
        const wrappedSubModel = await wrap(relModel, subRelGraph);
        wrappedModel = wrappedModel || {}
        wrappedModel[rel] = wrappedSubModel
      } else {
        wrappedModel[rel] = undefined
      }
    }
  }
  Reflect.setPrototypeOf(wrappedModel, model);
  return wrappedModel;
}
