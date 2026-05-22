// Google Sheets API Service
export const submitFormData = async (payload) => {
  try {
    await fetch("https://script.google.com/macros/s/AKfycbyP2Lmgj3NEwLj_YQpbZR8BDRLDaFp_iGwTGxWGtKKGYqdJE9pprDjrrFmeE2k2gAicEQ/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });

    return { success: true, message: "ส่งข้อมูลแล้ว" };
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, message: "error", error: err };
  }
};
