const chalk = require("chalk");
const mockStore: Map<string, any> = new Map();

type MockItem = {
  type: string;
  id: string;
  item?: any;
};

export function addMock({ type, id, item }: MockItem) {
  let store = mockStore.get(type);
  if (!store) {
    store = new Map();
    mockStore.set(type, store);
  }
  store.set(id, item);
}

export function getMock({ type, id }: MockItem): any {
  const store = mockStore.get(type);
  if (store) {
    const mock = store.get(id);
    return mock;
  }
  process.stdout.write(
    chalk.yellow(`getMock[type=${type}, id=${id}] => Store not found\n`)
  );
  return null;
}
