export function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(tasks.length);
    let started = 0;
    let finished = 0;

    function runNext() {
      if (started >= tasks.length) return;
      const idx = started++;
      tasks[idx]()
        .then((result) => {
          results[idx] = result;
          finished++;
          if (finished === tasks.length) {
            resolve(results);
          } else {
            runNext();
          }
        })
        .catch(reject);
    }

    const initial = Math.min(concurrency, tasks.length);
    for (let i = 0; i < initial; i++) runNext();
  });
}
