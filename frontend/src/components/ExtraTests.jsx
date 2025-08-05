// 1. ISP/IP Details (using ipinfo.io)
export async function getISPInfo() {
  try {
    const res = await fetch('https://ipwho.is/'); 
    if (!res.ok) throw new Error('Failed to fetch ISP info');
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

// 2. Jitter & Packet Loss (HTTP ping)
export async function pingTest(url, count = 10, timeout = 2000) {
  const times = [];
  let lost = 0;
  for (let i = 0; i < count; i++) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      await fetch(`${url}?t=${Date.now()}`, { signal: controller.signal });
      clearTimeout(timer);
      times.push(performance.now() - start);
    } catch {
      lost++;
    }
    await new Promise(r => setTimeout(r, 100)); // small delay between pings
  }
  // Jitter: mean absolute deviation
  const avg = times.reduce((a, b) => a + b, 0) / (times.length || 1);
  const jitter = times.reduce((a, b) => a + Math.abs(b - avg), 0) / (times.length || 1);
  const packetLoss = (lost / count) * 100;
  return { times, jitter, packetLoss };
}

// 3. Automatic Location Detection (browser geolocation)
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
    } else {
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(err.message)
      );
    }
  });
}

// 4. Device/Browser Detection
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    vendor: navigator.vendor
  };
}

// 5. Connection Type & Downlink Estimate
export function getConnectionInfo() {
  if ('connection' in navigator) {
    const { effectiveType, downlink, rtt, saveData } = navigator.connection;
    return { effectiveType, downlink, rtt, saveData };
  }
  return { error: 'Network Information API not supported' };
}