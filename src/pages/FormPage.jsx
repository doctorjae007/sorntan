import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import PeriodCard from "../components/PeriodCard";
import ExportButton from "../components/ExportButton";
import { getSubstituteAssignments, submitFormData } from "../services/api";
import { getAvailableTeachers, getTeacherLessons } from "../data/teacherSchedules";

export default function FormPage({ onSubmit }) {
  const teacherList = [
    "คุณครูนัทลียา",
    "คุณครูโอวาท",
    "คุณครูสุไหวย๊ะ",
    "คุณครูสุนิดา",
    "คุณครูธัญญลักษณ์",
    "คุณครูศศิวิมล",
    "คุณครูชวนพิศ",
    "คุณครูจีราพร",
    "คุณครูสิรินันท์",
    "คุณครูณฐกานต์",
    "คุณครูอรุณี",
    "คุณครูธันยากร",
    "คุณครูธนพงษ์",
    "คุณครูพงศพัฒน์",
    "คุณครูจันทร์จิรา",
    "คุณครูนุชรี"
  ];

  const subjectList = [
    "ศิลปะ","ดนตรี","พละศึกษา","สุขศึกษา","คณิตศาสตร์",
    "ภาษาไทย","วิทยาศาสตร์","วิทยาการคำนวณ","วิชาชีพ",
    "สังคมศึกษา","ประวัติศาสตร์","การป้องกันทุจริต",
    "ลูกเสือเนตรนารี","การงานอาชีพ","ภาษาต่างประเทศ"
  ];

  const levelList = ["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6","ม.1","ม.2","ม.3"];

  const [form, setForm] = useState({
    date: "",
    absentTeacher: ""
  });

  const [periods, setPeriods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);

  const assignmentsByTeacher = useMemo(() => {
    const grouped = new Map();
    assignments.forEach((item) => {
      const current = grouped.get(item.teacher) || [];
      current.push(item.period);
      grouped.set(item.teacher, current);
    });

    return Array.from(grouped, ([teacher, teacherPeriods]) => ({
      teacher,
      periods: [...new Set(teacherPeriods)].sort((a, b) => Number(a) - Number(b)),
    }));
  }, [assignments]);

  useEffect(() => {
    let active = true;
    if (!form.date) {
      setAssignments([]);
      return undefined;
    }

    setAssignments([]);
    setIsAssignmentsLoading(true);
    getSubstituteAssignments(form.date).then((result) => {
      if (!active) return;
      setAssignments(result.success ? result.assignments : []);
      setIsAssignmentsLoading(false);
    });

    return () => { active = false; };
  }, [form.date]);

  const handleFormChange = (e) => {
    const nextForm = { ...form, [e.target.name]: e.target.value };
    setForm(nextForm);
    if (nextForm.date && nextForm.absentTeacher) {
      setPeriods(
        getTeacherLessons(nextForm.absentTeacher, nextForm.date).map((lesson) => ({
          period: String(lesson.period),
          level: lesson.level.replace(/\/\d+$/, ""),
          subject: lesson.subject,
          substituteTeacher: "",
        }))
      );
    }
  };

  const addPeriod = () => {
    setPeriods([...periods, { period:"", level:"", subject:"", substituteTeacher:"" }]);
  };

  const handleChange = (index, e) => {
    const updated = [...periods];
    updated[index][e.target.name] = e.target.value;
    setPeriods(updated);
  };

  const removePeriod = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      periods
    };

    setIsLoading(true);
    const result = await submitFormData(payload);

    setIsLoading(false);

    alert(result.message);

    if (result.success) {
      // Pass data to parent and navigate to report
      onSubmit(payload);
      setForm({ date: "", absentTeacher: "" });
      setPeriods([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      
      {/* Container */}
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <Header />

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 border border-slate-200">
          
          {/* Date and Teacher Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            
            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📅 วันที่
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white"
              />
            </div>

            {/* Teacher Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                👨‍🏫 ครูที่ไม่มาปฏิบัติราชการ
              </label>
              <select
                name="absentTeacher"
                value={form.absentTeacher}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition bg-white"
              >
                <option value="">-- เลือกครู --</option>
                {teacherList.map((t,i)=>(
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {form.date && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold text-slate-800">ครูที่สอนแทนวันนี้</h2>
                <span className="text-xs text-slate-500">{form.date}</span>
              </div>

              {isAssignmentsLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
              ) : assignmentsByTeacher.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีครูที่ถูกจัดสอนแทนในวันนี้</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignmentsByTeacher.map((item, index) => (
                    <div
                      key={item.teacher}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        index % 3 === 0
                          ? "border-sky-200 bg-sky-50"
                          : index % 3 === 1
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <span className="font-bold text-slate-800">{item.teacher}</span>
                      <span className="ml-2 text-slate-600">
                        คาบที่สอนแทน {item.periods.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Period Button */}
          <button 
            onClick={addPeriod}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded-md transition border border-slate-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <span>➕</span> เพิ่มคาบ
          </button>
        </div>

        {/* Periods List */}
        <div className="space-y-4 mb-6">
          {periods.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-700">
              <p className="text-lg font-semibold">ยังไม่มีคาบสอนที่เพิ่มเข้ามา</p>
              <p className="text-sm text-slate-500 mt-2">กรุณากดปุ่ม "➕ เพิ่มคาบ" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            periods.map((p, index) => (
              <PeriodCard 
                key={index}
                index={index}
                period={p}
                levelList={levelList}
                subjectList={subjectList}
                teacherList={getAvailableTeachers(
                  teacherList,
                  form.date,
                  p.period,
                  form.absentTeacher
                )}
                availabilityReady={Boolean(form.date && p.period)}
                onRemove={removePeriod}
                onChange={handleChange}
              />
            ))
          )}
        </div>

        {/* Submit Button */}
        <ExportButton onClick={handleSubmit} isLoading={isLoading} />

      </div>
    </div>
  );
}
