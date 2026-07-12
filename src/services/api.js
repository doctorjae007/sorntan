const API_URL = "https://script.google.com/macros/s/AKfycbw6pYjSTU3wQ3f-VZg8HxE2nlF8pyWi-MMT0zpXWS1J53tQI8FNkg87denoVh9SKgeqRw/exec";

const encodePayload = (payload) => {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const jsonpRequest = (requestParams) => new Promise((resolve) => {
  const callbackName = `__substitutionCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement("script");

  const cleanup = () => {
    window.clearTimeout(timeout);
    delete window[callbackName];
    script.remove();
  };

  const fail = () => {
    cleanup();
    resolve({ success: false, message: "เชื่อมต่อระบบบันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" });
  };

  const timeout = window.setTimeout(fail, 30000);
  window[callbackName] = (result) => {
    cleanup();
    resolve(result);
  };
  script.onerror = fail;

  const params = new URLSearchParams({ callback: callbackName, ...requestParams });
  script.src = `${API_URL}?${params.toString()}`;
  document.head.appendChild(script);
});

export const submitFormData = (payload) => jsonpRequest({
  payloadBase64: encodePayload(payload)
});

export const getSubstituteAssignments = (date) => jsonpRequest({
  action: "listAssignments",
  date
});
