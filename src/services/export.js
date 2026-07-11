// Export utilities for CSV and PDF
import khuhaLogo from "../assets/Khuha.jpg";

const HTML2PDF_SRC = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

const imageUrlToDataUrl = async (imageUrl) => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("ไม่สามารถโหลดโลโก้โรงเรียนได้");
  }

  const imageBlob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์โลโก้โรงเรียนได้"));
    reader.readAsDataURL(imageBlob);
  });
};

export const exportToPDF = async (data, filename = "report.pdf") => {
  const logoDataUrl = await imageUrlToDataUrl(khuhaLogo);
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>รายงานการสอนแทน</title>
      <script src="${HTML2PDF_SRC}"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'TH SarabunPSK', 'Tahoma', Arial, sans-serif;
          line-height: 1.2;
          color: #000;
          padding: 20px;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 30px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          margin: 0 auto 10px;
          display: block;
        }
        
        .school-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .form-title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          
        }
        
        .semester {
          font-size: 12px;
          margin-top: 5px;
        }
        
        .info-section {
          margin: 20px 0;
          display: table;
          width: 100%;
        }
        
        .info-row {
          display: table-cell;
          width: 50%;
          padding-right: 20px;
          margin-bottom: 15px;
        }
        
        .info-label {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .info-value {
          border-bottom: 1px dotted #000;
          padding: 5px;
          min-height: 18px;
          font-size: 13px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #d3d3d3;
          font-weight: bold;
          text-align: center;
          font-size: 12px;
        }
        
        .number {
          text-align: center;
          width: 40px;
        }
        
        .signature-section {
          margin-top: 40px;
          display: table;
          width: 100%;
        }
        
        .signature-block {
          display: table-cell;
          text-align: center;
          width: 50%;
          padding: 0 30px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 50px;
          margin-bottom: 10px;
        }
        
        .signature-label {
          font-size: 11px;
          line-height: 1.4;
        }
        
        .date-label {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container" id="pdf-content">
        <div class="header">
            <img src="${logoDataUrl}" alt="โลโก้โรงเรียนบ้านคูหา" class="logo" />
          <div class="school-name">บันทึกการสอนแทนครูที่ปฏิบัติราชการ/ไม่มาปฏิบัติราชการ</div>
          <div class="school-name">โรงเรียนบ้านคูหา</div>
          <div class="form-title">ตารางการสอนแทน</div>
          <div class="semester">ภาคเรียนที่ 1 ปีการศึกษา 2569</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">วันที่ :</div>
            <div class="info-value">${data.date}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ครูที่ไม่มาปฏิบัติราชการ :</div>
            <div class="info-value">${data.absentTeacher}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 40px;">ลำดับ</th>
              <th rowspan="2">รายชื่อครูที่ปฏิบัติราชการ</th>
              <th colspan="3">ตารางสอนแทน</th>
              <th colspan="2">การสอนแทน</th>
            </tr>
            <tr>
              <th style="width: 100px;">รายวิชา</th>
              <th style="width: 60px;">คาบที่</th>
              <th style="width: 60px;">ชั้น</th>
              <th style="width: 120px;">ครูที่สอนแทน</th>
              <th style="width: 80px;">ลายเซ็นต์</th>
            </tr>
          </thead>
          <tbody>
            ${data.periods.map((period, index) => `
              <tr>
                <td class="number">${index + 1}</td>
                <td>${data.absentTeacher}</td>
                <td>${period.subject}</td>
                <td>${period.period}</td>
                <td>${period.level}</td>
                <td>${period.substituteTeacher}</td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              หัวหน้าวิชาการ<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              ผู้บริหารโรงเรียน<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
        </div>
      </div>

      <script>
        const logo = document.querySelector('.logo');

        const createPdf = () => {
          const element = document.getElementById('pdf-content');
          const opt = {
            margin: 10,
            filename: '${filename}',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
          };
          html2pdf().set(opt).from(element).save();
        };

        if (logo.complete) {
          createPdf();
        } else {
          logo.addEventListener('load', createPdf, { once: true });
        }
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

};

export const exportToCSV = (data, filename = "export.csv") => {
  const headers = ["วันที่", "ครูที่ไม่มา", "คาบ", "ระดับ", "วิชา", "ครูสอนแทน"];
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers with BOM for Thai language support
  csvContent += "\uFEFF" + headers.join(",") + "\n";
  
  // Add data rows
  data.periods.forEach(period => {
    const row = [
      data.date,
      data.absentTeacher,
      period.period,
      period.level,
      period.subject,
      period.substituteTeacher
    ];
    csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDFLegacy = (data, filename = "report.pdf") => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>รายงานการสอนแทน</title>
      <script src="${HTML2PDF_SRC}"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'TH SarabunPSK', 'Tahoma', Arial, sans-serif;
          line-height: 1.2;
          color: #000;
          padding: 20px;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 30px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          margin: 0 auto 10px;
          display: block;
        }
        
        .school-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .form-title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          
        }
        
        .semester {
          font-size: 12px;
          margin-top: 5px;
        }
        
        .info-section {
          margin: 20px 0;
          display: table;
          width: 100%;
        }
        
        .info-row {
          display: table-cell;
          width: 50%;
          padding-right: 20px;
          margin-bottom: 15px;
        }
        
        .info-label {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .info-value {
          border-bottom: 1px dotted #000;
          padding: 5px;
          min-height: 18px;
          font-size: 13px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #d3d3d3;
          font-weight: bold;
          text-align: center;
          font-size: 12px;
        }
        
        .number {
          text-align: center;
          width: 40px;
        }
        
        .signature-section {
          margin-top: 40px;
          display: table;
          width: 100%;
        }
        
        .signature-block {
          display: table-cell;
          text-align: center;
          width: 50%;
          padding: 0 30px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 50px;
          margin-bottom: 10px;
        }
        
        .signature-label {
          font-size: 11px;
          line-height: 1.4;
        }
        
        .date-label {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container" id="pdf-content">
        <div class="header">
            <img src="data:image/khuha.jpg" alt="Logo" class="logo" />
          <div class="school-name">บันทึกการสอนแทนครูที่ปฏิบัติราชการ/ไม่มาปฏิบัติราชการ</div>
          <div class="school-name">โรงเรียนบ้านคูหา</div>
          <div class="form-title">ตารางการสอนแทน</div>
          <div class="semester">ภาคเรียนที่ 1 ปีการศึกษา 2569</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">วันที่ :</div>
            <div class="info-value">${data.date}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ครูที่ไม่มาปฏิบัติราชการ :</div>
            <div class="info-value">${data.absentTeacher}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 40px;">ลำดับ</th>
              <th rowspan="2">รายชื่อครูที่ปฏิบัติราชการ</th>
              <th colspan="3">ตารางสอนแทน</th>
              <th colspan="2">การสอนแทน</th>
            </tr>
            <tr>
              <th style="width: 100px;">รายวิชา</th>
              <th style="width: 60px;">คาบที่</th>
              <th style="width: 60px;">ชั้น</th>
              <th style="width: 120px;">ครูที่สอนแทน</th>
              <th style="width: 80px;">ลายเซ็นต์</th>
            </tr>
          </thead>
          <tbody>
            ${data.periods.map((period, index) => `
              <tr>
                <td class="number">${index + 1}</td>
                <td>${data.absentTeacher}</td>
                <td>${period.subject}</td>
                <td>${period.period}</td>
                <td>${period.level}</td>
                <td>${period.substituteTeacher}</td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              หัวหน้าวิชาการ<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              ผู้บริหารโรงเรียน<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
        </div>
      </div>

      <script>
        const element = document.getElementById('pdf-content');
        const opt = {
          margin: 10,
          filename: '${filename}',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        html2pdf().set(opt).from(element).save();
      </script>
    </body>
    </html>
  `;

  const htmlWithLogo = htmlContent.replace(
    /<img src="data:image\/jpeg;base64,[^"]*" alt="Logo" class="logo" \/>/,
    `<img src="${khuhaLogo}" alt="Khuha logo" class="logo" />`
  );

  const blob = new Blob([htmlWithLogo], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

};

export const exportToCSVLegacy = (data, filename = "export.csv") => {
  const headers = ["วันที่", "ครูที่ไม่มา", "คาบ", "ระดับ", "วิชา", "ครูสอนแทน"];
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers with BOM for Thai language support
  csvContent += "\uFEFF" + headers.join(",") + "\n";
  
  // Add data rows
  data.periods.forEach(period => {
    const row = [
      data.date,
      data.absentTeacher,
      period.period,
      period.level,
      period.subject,
      period.substituteTeacher
    ];
    csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate PDF HTML content
 */
const generatePDFContent = (data, filename) => {
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>รายงานการสอนแทน</title>
      <script src="${HTML2PDF_SRC}"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'TH SarabunPSK', 'Tahoma', Arial, sans-serif;
          line-height: 1.2;
          color: #000;
          padding: 20px;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 30px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          margin: 0 auto 10px;
          display: block;
        }
        
        .school-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .form-title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .semester {
          font-size: 12px;
          margin-top: 5px;
        }
        
        .info-section {
          margin: 20px 0;
          display: table;
          width: 100%;
        }
        
        .info-row {
          display: table-cell;
          width: 50%;
          padding-right: 20px;
          margin-bottom: 15px;
        }
        
        .info-label {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .info-value {
          border-bottom: 1px dotted #000;
          padding: 5px;
          min-height: 18px;
          font-size: 13px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #d3d3d3;
          font-weight: bold;
          text-align: center;
          font-size: 12px;
        }
        
        .number {
          text-align: center;
          width: 40px;
        }
        
        .signature-section {
          margin-top: 40px;
          display: table;
          width: 100%;
        }
        
        .signature-block {
          display: table-cell;
          text-align: center;
          width: 50%;
          padding: 0 30px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 50px;
          margin-bottom: 10px;
        }
        
        .signature-label {
          font-size: 11px;
          line-height: 1.4;
        }
        
        .date-label {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container" id="pdf-content">
        <div class="header">
          <img src="${khuhaLogo}" alt="Khuha logo" class="logo" />
          <div class="school-name">บันทึกการสอนแทนครูที่ปฏิบัติราชการ/ไม่มาปฏิบัติราชการ</div>
          <div class="school-name">โรงเรียนบ้านคูหา</div>
          <div class="form-title">ตารางการสอนแทน</div>
          <div class="semester">ภาคเรียนที่ 1 ปีการศึกษา 2569</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">วันที่ :</div>
            <div class="info-value">${data.date}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ครูที่ไม่มาปฏิบัติราชการ :</div>
            <div class="info-value">${data.absentTeacher}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 40px;">ลำดับ</th>
              <th rowspan="2">รายชื่อครูที่ปฏิบัติราชการ</th>
              <th colspan="3">ตารางสอนแทน</th>
              <th colspan="2">การสอนแทน</th>
            </tr>
            <tr>
              <th style="width: 100px;">รายวิชา</th>
              <th style="width: 60px;">คาบที่</th>
              <th style="width: 60px;">ชั้น</th>
              <th style="width: 120px;">ครูที่สอนแทน</th>
              <th style="width: 80px;">ลายเซ็นต์</th>
            </tr>
          </thead>
          <tbody>
            ${data.periods.map((period, index) => `
              <tr>
                <td class="number">${index + 1}</td>
                <td>${data.absentTeacher}</td>
                <td>${period.subject}</td>
                <td>${period.period}</td>
                <td>${period.level}</td>
                <td>${period.substituteTeacher}</td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              หัวหน้าวิชาการ<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">
              ผู้บริหารโรงเรียน<br/>
              (........................)
            </div>
            <div class="date-label">วันที่ ........................</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export PDF and upload to Google Drive
 */
export const exportToPDFAndUpload = async (data, filename) => {
  try {
    // Generate HTML content
    const htmlContent = generatePDFContent(data, filename);
    
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.display = "none";
    document.body.appendChild(tempContainer);

    // Wait for html2pdf library to load and generate PDF
    return new Promise((resolve) => {
      const checkForHtml2pdf = setInterval(() => {
        if (window.html2pdf) {
          clearInterval(checkForHtml2pdf);
          
          const element = tempContainer.querySelector("#pdf-content");
          const opt = {
            margin: 10,
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
          };

          window.html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .output("blob")
            .then(async (pdfBlob) => {
              document.body.removeChild(tempContainer);
              
              // Get access token from localStorage
              const accessToken = localStorage.getItem("googleAccessToken");
              
              if (!accessToken) {
                throw new Error("ไม่พบ access token กรุณาลงชื่อเข้าใช้อีกครั้ง");
              }

              // Upload to Google Drive
              const result = await uploadPDFToGoogleDrive(
                pdfBlob,
                filename,
                accessToken
              );
              
              resolve(result);
            })
            .catch((error) => {
              document.body.removeChild(tempContainer);
              resolve({
                success: false,
                error: error.message,
              });
            });
        }
      }, 100);

      // Load html2pdf if not already loaded
      if (!window.html2pdf) {
        const script = document.createElement("script");
        script.src = HTML2PDF_SRC;
        document.head.appendChild(script);
      }
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
