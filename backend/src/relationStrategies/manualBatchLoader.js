export function createManualBatchLoader(batchLoad) {
  const cache = new Map();
  let queue = new Map();
  let scheduled = false;

  async function flush() {
    const batch = [...queue.values()];
    queue = new Map();
    scheduled = false;

    try {
      const values = await batchLoad(batch.map(({ key }) => key));

      if (!Array.isArray(values) || values.length !== batch.length) {
        throw new Error("A batch loader must return one value for each key.");
      }

      batch.forEach(({ resolve, reject }, index) => {
        const value = values[index];
        if (value instanceof Error) reject(value);
        else resolve(value);
      });
    } catch (error) {
      batch.forEach(({ key, reject }) => {
        cache.delete(key);
        reject(error);
      });
    }
  }

  return {
    load(key) {
      if (cache.has(key)) return cache.get(key);

      const promise = new Promise((resolve, reject) => {
        queue.set(key, { key, resolve, reject });

        if (!scheduled) {
          scheduled = true;
          queueMicrotask(flush);
        }
      });

      cache.set(key, promise);
      return promise;
    },
  };
}
