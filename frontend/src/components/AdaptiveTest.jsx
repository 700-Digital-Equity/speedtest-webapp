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
  timeThreshold = 12 // seconds — if download is faster than this, increase load
} = {}) => {
  const startTime = performance.now();
  let totalBytes = 0;
  let isStopped = false;
  let concurrency = initialConcurrency;
  let useSmallFile = true; // Start with 10MB file

  const getCurrentUrl = () => {
    return useSmallFile ? `${SERVER}/10MB.bin` : `${SERVER}/100MB.bin`;
  };

  const download = async () => {
    while (!isStopped) {
      try {
        const currentUrl = getCurrentUrl();
        const res = await fetch(`${currentUrl}?adaptive=${Math.random()}`);
        const reader = res.body.getReader();
        while (!isStopped) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;

          // Check time limit on every chunk read
          if (performance.now() - startTime > maxDuration) {
            isStopped = true;
            break;
          }
        }
      } catch (_) {
        break; // Ignore errors
      }
    }
  };

  let downloads = Array(concurrency).fill(0).map(download);

  while (!isStopped && (performance.now() - startTime) < maxDuration) {
    const roundStart = performance.now();
    await Promise.all(downloads);
    const roundDuration = (performance.now() - roundStart) / 1000;

    // Check time limit after each round
    if (performance.now() - startTime >= maxDuration) {
      isStopped = true;
      break;
    }

    let needsRestart = false;

    // Adjust concurrency and file size dynamically
    if (roundDuration < timeThreshold) {
      if (concurrency < maxConcurrency) {
        concurrency++;
        needsRestart = true;
        console.log(`Increased concurrency to ${concurrency}`);
      } else if (useSmallFile) {
        // If we're at max concurrency and still fast, switch to larger file
        useSmallFile = false;
        needsRestart = true;
        console.log(`Switched to 100MB file for better saturation`);
      }
    } else if (roundDuration > timeThreshold) {
      if (!useSmallFile) {
        // If using large file and it's too slow, switch back to small file
        useSmallFile = true;
        needsRestart = true;
        console.log(`Switched back to 10MB file`);
      } else if (concurrency > 1) {
        // If using small file and still slow, reduce concurrency
        concurrency--;
        needsRestart = true;
        console.log(`Decreased concurrency to ${concurrency}`);
      }
    }

    // Restart downloads if concurrency or file size changed
    if (needsRestart && !isStopped) {
      // Stop current downloads
      isStopped = true;
      await Promise.all(downloads);
      
      // Check time limit before restarting
      if (performance.now() - startTime >= maxDuration) {
        break;
      }
      
      // Reset and create new downloads
      isStopped = false;
      downloads = Array(concurrency).fill(0).map(download);
    }
  }

  // Ensure everything stops
  isStopped = true;
  
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