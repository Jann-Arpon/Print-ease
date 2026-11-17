const cartDatabaseName = 'aljPrintEaseCart';
const cartStoreName = 'items';

const openCartDatabase = () => new Promise((resolve, reject) => {
  const request = window.indexedDB.open(cartDatabaseName, 1);

  request.onupgradeneeded = () => {
    request.result.createObjectStore(cartStoreName, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Could not open the local cart.'));
});

const runCartTransaction = async (mode, operation) => {
  const database = await openCartDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(cartStoreName, mode);
    let result;

    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Could not update the local cart.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('The local cart update was interrupted.'));
    };

    const request = operation(transaction.objectStore(cartStoreName));
    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => {
        reject(request.error || new Error('Could not access the local cart.'));
      };
    }
  });
};

const createCartItemId = () => {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

window.PrintEaseCart = Object.freeze({
  addItem(item) {
    const storedItem = {
      ...item,
      id: createCartItemId(),
      addedAt: new Date().toISOString()
    };
    return runCartTransaction('readwrite', store => store.add(storedItem)).then(() => storedItem);
  },
  getItems() {
    return runCartTransaction('readonly', store => store.getAll());
  },
  removeItem(id) {
    return runCartTransaction('readwrite', store => store.delete(id));
  }
});
