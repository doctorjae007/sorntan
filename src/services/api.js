const API_URL = "https://script.google.com/macros/s/AKfycbyjTMoTMsuZwepahR0Etc_C0x3BMyskBlQYe6_2PrP4oPl4xtF_u7jFXvbPL88hojSp9g/exec";

// JSONP is used because a Google Apps Script no-cors response cannot be read
// by the browser, while this screen needs the conflict result before moving on.
export const submitFormData = (payload) => new Promise((resolve) => {
  const callbackName = `__substitutionCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement("script");

  const cleanup = () => {
    window.clearTimeout(timeout);
    delete window[callbackName];
    script.remove();
  };

  const timeout = window.setTimeout(() => {
    cleanup();
    resolve({ success: false, message: "เชื่อมต่อระบบบันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" });
  }, 30000);

  window[callbackName] = (result) => {
    cleanup();
    resolve(result);
  };

  script.onerror = () => {
    cleanup();
    resolve({ success: false, message: "เชื่อมต่อระบบบันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" });
  };

  const params = new URLSearchParams({
    callback: callbackName,
    payload: JSON.stringify(payload)
  });
  script.src = `${API_URL}?${params.toString()}`;
  document.head.appendChild(script);
});
