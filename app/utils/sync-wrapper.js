export default async function wrap(model, relGraph) {
  const wrappedModel = {}
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
      const wrappedSubModel = await wrap(relModel, subRelGraph);
      wrappedModel[rel] = wrappedSubModel
    }
  }
  Reflect.setPrototypeOf(wrappedModel, model);
  return wrappedModel;
}
