const warmUpDownload = async () => {
  const res = await fetch(`${SERVER}/100MB.bin?warmup=${Math.random()}`);
  const reader = res.body.getReader();
  const start = performance.now();
  while (performance.now() - start < 2000) {
    const { done } = await reader.read();
    if (done) break;
  }
  reader.cancel();
};

  const SERVER = 'https://700-digital-equity.digital';


const adaptiveDownload = async () => {
  const concurrency = 2;
  const url = `${SERVER}/100MB.bin`;
  const startTime = performance.now();
  const maxDuration = 15000; // stop after 15s

  let totalBytes = 0;
  let isStopped = false;

  const download = async () => {
    while (!isStopped) {
      try {
        const res = await fetch(`${url}?adaptive=${Math.random()}`);
        const reader = res.body.getReader();
        while (!isStopped) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;

          // Stop if we’ve hit time limit
          if (performance.now() - startTime > maxDuration) {
            isStopped = true;
            break;
          }
        }
      } catch (_) {
        break; // error or abort
      }
    }
  };

  const downloads = Array(concurrency).fill(0).map(download);
  await Promise.all(downloads);
  const duration = (performance.now() - startTime) / 1000;

  return ((totalBytes * 8) / duration / 1_000_000).toFixed(2); // Mbps
};

const adaptiveUpload = async ({
  serverUrl = `${SERVER}/upload`,
  maxDuration = 10000,
  initialSizeMB = 40,
  maxBlobSizeMB = 500,
  maxConcurrency = 8,
  timeThreshold = 5 // seconds — if upload is faster than this, increase load
} = {}) => {
  const startTime = performance.now();
  let totalBytesUploaded = 0;
  let totalUploadTime = 0;

  let currentBlobSizeMB = initialSizeMB;
  let concurrency = 1;

  const createBlob = (sizeMB) => new Blob([new Uint8Array(sizeMB * 1024 * 1024)]);

  const fetchWithTimeout = (url, options, timeout = 12000) =>
    Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]);

  // Warm-up to avoid TCP slow-start
  try {
    await fetchWithTimeout(serverUrl, {
      method: 'POST',
      body: createBlob(1),
    }, 3000);
  } catch (_) {
    // Ignore warm-up failure
  }

  while ((performance.now() - startTime) < maxDuration) {
    const blob = createBlob(currentBlobSizeMB);
    const roundStart = performance.now();

    const uploads = new Array(concurrency).fill(null).map(async () => {
      try {
        await fetchWithTimeout(serverUrl, {
          method: 'POST',
          body: blob,
        }, 15000);
        totalBytesUploaded += blob.size;
      } catch (_) {
        // Ignore failed uploads
      }
    });

    await Promise.all(uploads);

    const roundDuration = (performance.now() - roundStart) / 1000;
    totalUploadTime += roundDuration;

    // Exit if maxDuration is reached
    if ((performance.now() - startTime) >= maxDuration) break;

    // Adapt blob size and concurrency
    if (roundDuration < timeThreshold && currentBlobSizeMB < maxBlobSizeMB) {
      if (concurrency < maxConcurrency) {
        concurrency++;
      } else {
        currentBlobSizeMB *= 2;
      }
    } else if (roundDuration > 3 && concurrency > 1) {
      concurrency--;
    }
  }

  if (totalUploadTime === 0) return "0";

  const uploadMbps = ((totalBytesUploaded * 8) / totalUploadTime / 1_000_000).toFixed(2);
  return uploadMbps;
};

const streamedUpload = async ({
  url = `${SERVER}/upload`,
  totalSizeMB = 500,
  chunkSizeKB = 512,
  maxDuration = 8000
} = {}) => {
  const totalSizeBytes = totalSizeMB * 1024 * 1024;
  const chunkSizeBytes = chunkSizeKB * 1024;

  let bytesSent = 0;
  const startTime = performance.now();

  const controller = new ReadableStream({
    pull(controller) {
      // Abort if total size or max duration exceeded
      const elapsed = performance.now() - startTime;
      if (bytesSent >= totalSizeBytes || elapsed > maxDuration) {
        controller.close();
        return;
      }

      // Push next chunk
      const chunk = new Uint8Array(chunkSizeBytes);
      controller.enqueue(chunk);
      bytesSent += chunk.length;
    }
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: controller,
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      duplex: 'half' 
    });

    const durationSeconds = (performance.now() - startTime) / 1000;
    const uploadMbps = ((bytesSent * 8) / durationSeconds / 1_000_000).toFixed(2);
    return uploadMbps;
  } catch (e) {
    console.error("Upload failed:", e);
    return "0";
  }
};



export {adaptiveDownload, adaptiveUpload, streamedUpload, warmUpDownload};