export default function PeriodCard({ 
  index, 
  period, 
  levelList, 
  subjectList, 
  teacherList, 
  availabilityReady,
  thanaphongIsScheduled,
  onRemove, 
  onChange 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
      
      {/* Period Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">
          คาบที่ {index + 1}
        </h3>
        <button 
          onClick={() => onRemove(index)}
          className="bg-white hover:bg-red-50 text-red-700 font-bold py-2 px-4 rounded-md transition border border-red-200 flex items-center gap-2"
        >
          <span>❌</span> ลบ
        </button>
      </div>

      {/* Selects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PERIOD */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">🕐 คาบ</label>
          <input 
            type="text" 
            name="period" 
            value={period.period} 
            onChange={(e) => onChange(index, e)}
            placeholder="เช่น คาบ 1, คาบ 2"
            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white text-sm ${
              period.substituteTeacher === "คุณครูธนพงษ์" && thanaphongIsScheduled
                ? "text-green-600 font-semibold"
                : "text-black"
            }`}
          />
        </div>

        {/* LEVEL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">📚 ระดับ</label>
          <select 
            name="level" 
            value={period.level} 
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white text-sm"
          >
            <option value="">-- เลือก --</option>
            {period.level && !levelList.includes(period.level) && (
              <option value={period.level}>{period.level}</option>
            )}
            {levelList.map((l, i) => (
              <option key={i} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* SUBJECT */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">📖 วิชา</label>
          <select 
            name="subject" 
            value={period.subject} 
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white text-sm"
          >
            <option value="">-- เลือก --</option>
            {period.subject && !subjectList.includes(period.subject) && (
              <option value={period.subject}>{period.subject}</option>
            )}
            {subjectList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* TEACHER */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">👩‍🏫 ครูสอนแทน</label>
          <select 
            name="substituteTeacher" 
            value={period.substituteTeacher} 
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white text-sm"
          >
            <option value="">-- เลือก --</option>
            {teacherList.map((t, i) => (
              <option
                key={i}
                value={t}
                className={
                  t === "คุณครูธนพงษ์" && thanaphongIsScheduled
                    ? "text-green-600 font-semibold"
                    : "text-black"
                }
              >
                {t}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {availabilityReady
              ? `พบครูว่าง ${teacherList.length} คน`
              : "เลือกวันที่และคาบเพื่อค้นหาครูที่ว่าง"}
          </p>
        </div>
      </div>
    </div>
  );
}
