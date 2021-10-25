import { ArcModelEventTypes } from '@advanced-rest-client/events';
import { VariablesModel } from '@advanced-rest-client/idb-store';
import { oneEvent } from '@open-wc/testing';

export async function resetSelection() {
  const model = new VariablesModel();
  if (model.currentEnvironment) {
    model.currentEnvironment = null;
    await oneEvent(window, ArcModelEventTypes.Environment.State.select);
  }
}
