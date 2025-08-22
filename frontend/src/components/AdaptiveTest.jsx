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
  maxDuration = 25000,
  initialConcurrency = 2,
  maxConcurrency = 16,
  timeThreshold = 10, // seconds — if download is faster than this, increase load
  onProgress, // Progress callback
} = {}) => {
  const globalStartTime = performance.now();
  let totalBytes = 0;
  let concurrency = initialConcurrency;
  let fileSize = 10; // Start with 10MB
  let stopAll = false;

  while (!stopAll && (performance.now() - globalStartTime) < maxDuration) {
    const download = async () => {
      try {
        const currentUrl = `${SERVER}/${fileSize}MB.bin`;
        const res = await fetch(`${currentUrl}?adaptive=${Math.random()}`);
        const reader = res.body.getReader();
        let downloaded = 0;
        const roundStart = performance.now();

        while (!stopAll) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
          downloaded += value.length;

          // Calculate global speed in Mbps and call onProgress if available
          const globalElapsed = (performance.now() - globalStartTime) / 1000;
          const globalSpeed = (totalBytes * 8) / (globalElapsed * 1_000_000); // Mbps
          if (onProgress) onProgress(globalSpeed, totalBytes, globalStartTime);

          if (performance.now() - roundStart > maxDuration) {
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
    if (performance.now() - globalStartTime >= maxDuration) {
      stopAll = true;
      break;
    }

    // Adjust concurrency and file size dynamically for next round
    if (roundDuration < timeThreshold) {
      if (concurrency < maxConcurrency) {
        concurrency = concurrency * 2;
        console.log(`Increased concurrency to ${concurrency}`);
      } else if (fileSize === 10) {
        fileSize = 100;
        concurrency = initialConcurrency; // Reset concurrency
        console.log(`Switched to 100MB file for better saturation`);
      } else if (fileSize === 100) {
        fileSize = 250;
        console.log(`Switched to 250MB file for even better saturation`);
      }
    } else if (roundDuration > timeThreshold) {
      if (fileSize === 250) {
        fileSize = 100;
        console.log(`Switched back to 100MB file`);
      } else if (fileSize === 100) {
        fileSize = 10;
        console.log(`Switched back to 10MB file`);
      } else if (concurrency > 1) {
        concurrency--;
        console.log(`Decreased concurrency to ${concurrency}`);
      }
    }
  }

  const duration = (performance.now() - globalStartTime) / 1000;
  const globalElapsed = (performance.now() - globalStartTime) / 1000;
  const globalSpeed = (totalBytes * 8) / (globalElapsed * 1_000_000); // Mbps
  if (onProgress) onProgress(globalSpeed, totalBytes, globalStartTime);
  return ((totalBytes * 8) / duration / 1_000_000).toFixed(2); // Mbps
};

const adaptiveUpload = async ({
  serverUrl = `${SERVER}/upload`,
  maxDuration = 28000,
  initialSizeMB = 30,
  maxBlobSizeMB = 500,
  maxConcurrency = 4,
  timeThreshold = 7, // seconds — if upload is faster than this, increase load
  onProgress // Progress callback
} = {}) => {
  const globalStartTime = performance.now();
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

  while ((performance.now() - globalStartTime) < maxDuration) {
    const blob = createBlob(currentBlobSizeMB);
    const roundStart = performance.now();

    const uploads = new Array(concurrency).fill(null).map(async () => {
      try {
        await fetchWithTimeout(serverUrl, {
          method: 'POST',
          body: blob,
        }, 15000);
        totalBytesUploaded += blob.size;

        // Live upload progress update
        const globalElapsed = (performance.now() - globalStartTime) / 1000;
        const globalSpeed = (totalBytesUploaded * 8) / (globalElapsed * 1_000_000); // Mbps
        if (onProgress) onProgress(globalSpeed.toFixed(2), totalBytesUploaded, globalStartTime);
      } catch (_) {
        // Ignore failed uploads
      }
    });

    await Promise.all(uploads);

    const roundDuration = (performance.now() - roundStart) / 1000;
    totalUploadTime += roundDuration;

    // Exit if maxDuration is reached
    if ((performance.now() - globalStartTime) >= maxDuration) break;

    // Adapt concurrency and blob size: increase concurrency first, then blob size
    if (roundDuration < timeThreshold) {
      if (concurrency < maxConcurrency) {
        concurrency = concurrency * 2;
      } else if (currentBlobSizeMB < maxBlobSizeMB) {
        currentBlobSizeMB *= 2;
        concurrency = 2;
      }
    } else if (roundDuration > timeThreshold && concurrency > 1) {
      concurrency--;
    }
  }

  if (totalUploadTime === 0) return "0";

  const uploadMbps = ((totalBytesUploaded * 8) / totalUploadTime / 1_000_000).toFixed(2);
  if (onProgress) onProgress(uploadMbps, totalBytesUploaded, globalStartTime);
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