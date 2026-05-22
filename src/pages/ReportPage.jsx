import { exportToCSV, exportToPDF } from "../services/export";

export default function ReportPage({ data, onBackToForm }) {
  if (!data || !data.periods || data.periods.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-slate-200">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center gap-3">
              <span>📊</span> รายงานการสอนแทน
            </h1>
            <p className="text-slate-600 mt-4 text-lg">
              ยังไม่มีข้อมูลที่บันทึก
            </p>
            <button 
              onClick={onBackToForm}
              className="mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-md transition shadow-sm"
            >
              ← กลับไปแบบฟอร์ม
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 mb-6 border border-slate-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            <span>📊</span> รายงานการสอนแทน
          </h1>
          <p className="text-slate-200 mt-2 text-sm sm:text-base">
            วันที่ {data.date} | ครูที่ไม่มาปฏิบัติราชการ: {data.absentTeacher}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button 
            onClick={() => exportToPDF(data, `report_${data.date}.pdf`)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded-md transition border border-slate-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📄</span> ส่งออก PDF
          </button>
          <button 
            onClick={() => exportToCSV(data, `report_${data.date}.csv`)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded-md transition border border-slate-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📥</span> ส่งออก CSV
          </button>
          <button 
            onClick={onBackToForm}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-md transition border border-slate-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <span>➕</span> เพิ่มข้อมูลใหม่
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-4 py-3 text-white font-bold text-left">ลำดับ</th>
                  <th className="px-4 py-3 text-white font-bold text-left">คาบ</th>
                  <th className="px-4 py-3 text-white font-bold text-left">ระดับ</th>
                  <th className="px-4 py-3 text-white font-bold text-left">วิชา</th>
                  <th className="px-4 py-3 text-white font-bold text-left">ครูสอนแทน</th>
                </tr>
              </thead>
              <tbody>
                {data.periods.map((period, index) => (
                  <tr 
                    key={index}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-700">{period.period}</td>
                    <td className="px-4 py-3 text-gray-700">{period.level}</td>
                    <td className="px-4 py-3 text-gray-700">{period.subject}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">
                      {period.substituteTeacher}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Display */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📋</span> ข้อมูล JSON
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}
