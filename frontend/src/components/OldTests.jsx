const measureDownload = async () => {
    const url = `${SERVER}/100MB.bin`;
    const concurrency = 4;
    const testDuration = 10 * 1000; // 10 seconds

    let totalBytes = 0;
    let isStopped = false;

    const download = async () => {
      while (!isStopped) {
        const res = await fetch(`${url}?cacheBust=${Math.random()}`);
        const reader = res.body.getReader();
        while (!isStopped) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
        }
      }
    };

    const downloads = new Array(concurrency).fill(0).map(download);

    const start = performance.now();
    await Promise.race([
      new Promise((resolve) => setTimeout(resolve, testDuration)),
      Promise.all(downloads),
    ]);
    isStopped = true;
    const duration = (performance.now() - start) / 1000;
    return ((totalBytes * 8) / duration / 1_000_000).toFixed(2); // Mbps
  };

  const warmUpUpload = async () => {
    const warmupBlob = new Blob([new Uint8Array(1 * 1024 * 1024)]); // 1MB
    await fetch(`${SERVER}/upload`, {
      method: 'POST',
      body: warmupBlob,
    });
  };
  const measureUpload = async () => {
    const blob = new Blob([new Uint8Array(20 * 1024 * 1024)]); // 20MB
    const start = performance.now();

    await fetch(`${SERVER}/upload`, {
        method: 'POST',
        body: blob,
    });

    const end = performance.now();
    const duration = (end - start) / 1000;
    return ((blob.size * 8) / duration / 1_000_000).toFixed(2); // Mbps
  };

  const measureParallelUpload = async (url = `${SERVER}/upload`, concurrency = 2, maxDuration = 15000) => {
  const blobSizeMB = 50;
  const blob = new Blob([new Uint8Array(blobSizeMB * 1024 * 1024)]); // 50MB blob
  const warmupBlob = new Blob([new Uint8Array(10 * 1024 * 1024)]); // 1MB warmup

  const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    ]);
  };

  // Warm-up: small upload to stabilize connection
  try {
    await fetchWithTimeout(url, { method: 'POST', body: warmupBlob }, 3000);
  } catch (_) {
    // ignore warmup failure
  }

  const uploadTimes = [];
  const abortController = new AbortController();

  // Create an overall timeout promise to abort all uploads after maxDuration
  const overallTimeout = new Promise((resolve) => {
    setTimeout(() => {
      abortController.abort(); // abort ongoing fetches
      resolve();
    }, maxDuration);
  });

  // Start all uploads but listen to abort signal
  const uploads = new Array(concurrency).fill(null).map(async () => {
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: blob,
        signal: abortController.signal,
      });
      if (res.ok) {
        const end = performance.now();
        uploadTimes.push((end - start) / 1000); // seconds
      }
    } catch (err) {
      // ignore timeout, abort, or fetch errors
    }
  });

  // Wait for either all uploads finish or overall timeout triggers
  await Promise.race([
    Promise.all(uploads),
    overallTimeout,
  ]);

  if (uploadTimes.length === 0) return "0";

  // Remove min/max outliers
  const trimmedTimes = removeOutliers(uploadTimes);
  const averageTime = trimmedTimes.reduce((a, b) => a + b, 0) / trimmedTimes.length;

  // total bits uploaded = blob size * successful uploads * 8 bits/byte
  const totalBitsUploaded = blob.size * trimmedTimes.length * 8;

  return (totalBitsUploaded / averageTime / 1_000_000).toFixed(2); // Mbps
};

const removeOutliers = (arr) => {
  if (arr.length <= 2) return arr;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.slice(1, -1); // remove min and max
};

//   const warmUpDownload = async () => {
//   const res = await fetch(`${SERVER}/100MB.bin?warmup=${Math.random()}`);
//   const reader = res.body.getReader();
//   const start = performance.now();
//   while (performance.now() - start < 2000) {
//     const { done } = await reader.read();
//     if (done) break;
//   }
//   reader.cancel();
// };
  // Improved Download Test: multiple parallel requests over a fixed duration