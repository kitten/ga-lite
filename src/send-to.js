function fallbackSendTo(url) {
  const i = new Image()
  i.src = url
}

export default function sendTo(url) {
  if (
    typeof navigator === 'undefined' ||
    !navigator.sendBeacon ||
    !navigator.sendBeacon(url)
  ) {
    try {
      const req = new XMLHttpRequest()
      req.timeout = 5000;
      req.ontimeout = req.onerror = fallbackSendTo.bind(null, url);
      req.open('GET', url, true);
      req.send();
    } catch (_error) {
      fallback(url);
    }
  }
}
