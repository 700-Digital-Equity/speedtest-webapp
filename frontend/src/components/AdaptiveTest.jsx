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

const adaptiveDownload = async ({
  maxDuration = 20000,
  initialConcurrency = 4,
  maxConcurrency = 8,
  timeThreshold = 8 // seconds — if download is faster than this, increase load
} = {}) => {
  const startTime = performance.now();
  let totalBytes = 0;
  let concurrency = initialConcurrency;
  let useSmallFile = true; // Start with 10MB file
  let stopAll = false;

  while (!stopAll && (performance.now() - startTime) < maxDuration) {
    const download = async () => {
      try {
        const currentUrl = useSmallFile ? `${SERVER}/10MB.bin` : `${SERVER}/100MB.bin`;
        const res = await fetch(`${currentUrl}?adaptive=${Math.random()}`);
        const reader = res.body.getReader();
        while (!stopAll) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
          if (performance.now() - startTime > maxDuration) {
            stopAll = true;
            break;
          }
        }
      } catch (_) {
        // Ignore errors
      }
    };

    const downloads = Array(concurrency).fill(0).map(() => download());
    const roundStart = performance.now();
    await Promise.all(downloads);
    const roundDuration = (performance.now() - roundStart) / 1000;

    // If time is up, break out of the main loop immediately
    if (performance.now() - startTime >= maxDuration) {
      stopAll = true;
      break;
    }

    // Adjust concurrency and file size dynamically for next round
    if (roundDuration < timeThreshold) {
      if (concurrency < maxConcurrency) {
        concurrency++;
        console.log(`Increased concurrency to ${concurrency}`);
      } else if (useSmallFile) {
        useSmallFile = false;
        console.log(`Switched to 100MB file for better saturation`);
      }
    } else if (roundDuration > timeThreshold) {
      if (!useSmallFile) {
        useSmallFile = true;
        console.log(`Switched back to 10MB file`);
      } else if (concurrency > 1) {
        concurrency--;
        console.log(`Decreased concurrency to ${concurrency}`);
      }
    }
  }

  const duration = (performance.now() - startTime) / 1000;
  return ((totalBytes * 8) / duration / 1_000_000).toFixed(2); // Mbps
};

const adaptiveUpload = async ({
  serverUrl = `${SERVER}/upload`,
  maxDuration = 18000,
  initialSizeMB = 25,
  maxBlobSizeMB = 500,
  maxConcurrency = 8,
  timeThreshold = 8 // seconds — if upload is faster than this, increase load
} = {}) => {
  const startTime = performance.now();
  let totalBytesUploaded = 0;
  let totalUploadTime = 0;

  let currentBlobSizeMB = initialSizeMB;
  let concurrency = 2;
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
    } else if (roundDuration > timeThreshold && concurrency > 1) {
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