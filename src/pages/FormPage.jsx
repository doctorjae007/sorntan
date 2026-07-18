import { useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import Header from "../components/Header";
import PeriodCard from "../components/PeriodCard";
import ExportButton from "../components/ExportButton";
import { getSubstituteAssignments, submitFormData } from "../services/api";
import { exportToPDF } from "../services/export";
import { getAvailableTeachers, getTeacherLessons, isTeacherScheduled } from "../data/teacherSchedules";

const teacherCardStyles = [
  { emoji: "😊", avatar: "bg-rose-100", accent: "bg-rose-400" },
  { emoji: "😄", avatar: "bg-sky-100", accent: "bg-sky-400" },
  { emoji: "🙂", avatar: "bg-amber-100", accent: "bg-amber-400" },
  { emoji: "😁", avatar: "bg-emerald-100", accent: "bg-emerald-400" },
  { emoji: "🥰", avatar: "bg-violet-100", accent: "bg-violet-400" },
  { emoji: "😎", avatar: "bg-orange-100", accent: "bg-orange-400" },
  { emoji: "🤗", avatar: "bg-cyan-100", accent: "bg-cyan-400" },
  { emoji: "😇", avatar: "bg-fuchsia-100", accent: "bg-fuchsia-400" },
  { emoji: "😃", avatar: "bg-lime-100", accent: "bg-lime-400" },
  { emoji: "😉", avatar: "bg-teal-100", accent: "bg-teal-400" },
  { emoji: "😌", avatar: "bg-pink-100", accent: "bg-pink-400" },
  { emoji: "🤩", avatar: "bg-indigo-100", accent: "bg-indigo-400" },
  { emoji: "😺", avatar: "bg-yellow-100", accent: "bg-yellow-400" },
  { emoji: "😸", avatar: "bg-red-100", accent: "bg-red-400" },
  { emoji: "🥳", avatar: "bg-blue-100", accent: "bg-blue-400" },
  { emoji: "😀", avatar: "bg-green-100", accent: "bg-green-400" },
];

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
  const [archivedReports, setArchivedReports] = useState([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef(null);

  const assignmentsByTeacher = useMemo(() => {
    const grouped = new Map();
    assignments.forEach((item) => {
      const current = grouped.get(item.teacher) || [];
      current.push({ period: item.period, level: item.level, subject: item.subject });
      grouped.set(item.teacher, current);
    });

    return Array.from(grouped, ([teacher, teacherAssignments]) => ({
      teacher,
      assignments: Array.from(
        new Map(
          teacherAssignments.map((item) => [`${item.period}|${item.level}|${item.subject || ""}`, item])
        ).values()
      ).sort((a, b) => Number(a.period) - Number(b.period)),
    }));
  }, [assignments]);

  const downloadableReports = useMemo(() => {
    if (archivedReports.length > 0) return archivedReports;

    const grouped = new Map();
    assignments.forEach((item) => {
      const absentTeacher = item.absentTeacher || "-";
      const periods = grouped.get(absentTeacher) || [];
      periods.push({
        period: item.period,
        level: item.level,
        subject: item.subject,
        substituteTeacher: item.teacher,
      });
      grouped.set(absentTeacher, periods);
    });

    return Array.from(grouped, ([absentTeacher, reportPeriods], index) => ({
      id: `legacy-${index}`,
      date: form.date,
      absentTeacher,
      periods: reportPeriods,
    }));
  }, [archivedReports, assignments, form.date]);

  useEffect(() => {
    let active = true;
    if (!form.date) {
      setAssignments([]);
      setArchivedReports([]);
      return undefined;
    }

    setAssignments([]);
    setArchivedReports([]);
    setIsAssignmentsLoading(true);
    getSubstituteAssignments(form.date).then((result) => {
      if (!active) return;
      setAssignments(result.success ? result.assignments : []);
      setArchivedReports(result.success && Array.isArray(result.reports) ? result.reports : []);
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

  const createCardBlob = async () => {
    const card = shareCardRef.current;
    const assignmentGrid = card.querySelector("[data-assignment-grid]");
    const previousCardWidth = card.style.width;
    const previousGridStyles = assignmentGrid?.getAttribute("style");

    card.style.width = "900px";
    if (assignmentGrid) {
      assignmentGrid.style.display = "grid";
      assignmentGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
      assignmentGrid.style.gap = "12px";
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const blob = await toBlob(card, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio: 2,
        width: 900,
      });
      if (!blob) throw new Error("Unable to create image");
      return blob;
    } finally {
      card.style.width = previousCardWidth;
      if (assignmentGrid) {
        if (previousGridStyles === null) assignmentGrid.removeAttribute("style");
        else assignmentGrid.setAttribute("style", previousGridStyles);
      }
    }
  };

  const handleShareCard = async () => {
    if (!shareCardRef.current || !form.date || assignmentsByTeacher.length === 0) return;

    setIsSharing(true);
    try {
      const blob = await createCardBlob();
      const filename = `substitute-teachers-${form.date}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `สรุปการจัดครูสอนแทน ${form.date}`,
          text: `สรุปการจัดครูสอนแทน วันที่ ${form.date}`,
          files: [file],
        });
      } else alert("อุปกรณ์นี้ไม่รองรับการแชร์ไฟล์ กรุณาใช้ปุ่มดาวน์โหลด PNG");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share card error:", error);
        alert("ไม่สามารถสร้างรูปสำหรับแชร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || !form.date || assignmentsByTeacher.length === 0) return;

    setIsDownloading(true);
    try {
      const blob = await createCardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `substitute-teachers-${form.date}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download card error:", error);
      alert("ไม่สามารถดาวน์โหลดรูปได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDownloading(false);
    }
  };

  const getTeacherLoad = (teacher, currentPeriodIndex) => {
    const regularPeriods = new Set(
      getTeacherLessons(teacher, form.date).map((lesson) => String(lesson.period))
    );
    const substitutePeriods = new Set();

    assignments.forEach((assignment) => {
      if (assignment.teacher === teacher) {
        substitutePeriods.add(String(assignment.period));
      }
    });

    periods.forEach((item, itemIndex) => {
      if (itemIndex !== currentPeriodIndex && item.substituteTeacher === teacher && item.period) {
        substitutePeriods.add(String(item.period));
      }
    });

    return {
      regular: regularPeriods.size,
      substitute: substitutePeriods.size,
      total: regularPeriods.size + substitutePeriods.size,
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <main className="min-w-0">

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

          {false && form.date && (
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
                teacherLoadByName={Object.fromEntries(
                  teacherList.map((teacher) => [teacher, getTeacherLoad(teacher, index)])
                )}
                availabilityReady={Boolean(form.date && p.period)}
                thanaphongIsScheduled={isTeacherScheduled(
                  "คุณครูธนพงษ์",
                  form.date,
                  p.period
                )}
                onRemove={removePeriod}
                onChange={handleChange}
              />
            ))
          )}
        </div>

        {/* Submit Button */}
        <ExportButton onClick={handleSubmit} isLoading={isLoading} />

          </main>

          <aside className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm lg:sticky lg:top-6">
            <div
              ref={shareCardRef}
              className="w-full bg-white"
            >
            <div className="border-b border-slate-700 bg-slate-800 px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    สรุปการจัดครูสอนแทน
                  </p>
                  <h2 className="mt-1 text-lg font-bold">ครูที่สอนแทนวันนี้</h2>
                </div>
                <span className="rounded-md border border-slate-500 px-2.5 py-1 text-xs font-semibold text-slate-200">ประจำวัน</span>
              </div>
              {form.date && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-600 pt-3">
                  <span className="text-xs text-slate-300">วันที่จัดสอนแทน</span>
                  <span className="text-sm font-bold">{form.date}</span>
                </div>
              )}
            </div>

            <div className="p-4">
            {!form.date ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">กรุณาเลือกวันที่เพื่อดูรายการ</p>
              </div>
            ) : isAssignmentsLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                <span>กำลังโหลดข้อมูล...</span>
              </div>
            ) : assignmentsByTeacher.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center">
                <p className="text-sm font-medium text-slate-600">ยังไม่มีครูที่ถูกจัดสอนแทนในวันนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-xs font-semibold text-slate-500">รายชื่อที่จัดแล้ว</span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {assignmentsByTeacher.length} คน
                  </span>
                </div>
                <div data-assignment-grid className="space-y-3">
                {assignmentsByTeacher.map((item, index) => {
                  const cardStyle = teacherCardStyles[index % teacherCardStyles.length];
                  return (
                  <div
                    key={item.teacher}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 ${cardStyle.accent}`} />
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${cardStyle.avatar}`}
                        role="img"
                        aria-label={`รูปแทน ${item.teacher}`}
                      >
                        {cardStyle.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{item.teacher}</p>
                        <p className="mt-0.5 text-xs text-slate-500">สอนแทน {item.assignments.length} คาบ</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-1.5">
                      {item.assignments.map((assignment) => (
                        <div
                          key={`${assignment.period}-${assignment.level}-${assignment.subject || ""}`}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                        >
                          <span className="text-slate-500">คาบที่ <strong className="text-slate-800">{assignment.period}</strong></span>
                          <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 font-bold text-slate-700 shadow-sm">
                            ชั้น {assignment.level}{assignment.subject ? ` • ${assignment.subject}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
                </div>
              </div>
            )}
            </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-4">
              {downloadableReports.length > 0 && (
                <div className="mb-3 rounded-md border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-xs font-bold text-slate-600">PDF ย้อนหลัง</p>
                  <div className="space-y-2">
                    {downloadableReports.map((report, index) => (
                      <button
                        key={report.id || `${report.absentTeacher}-${index}`}
                        type="button"
                        onClick={() => exportToPDF(report, `report_${form.date}_${index + 1}.pdf`)}
                        className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                      >
                        <span className="truncate">{report.absentTeacher}</span>
                        <span className="shrink-0 text-slate-500">ดาวน์โหลด PDF</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareCard}
                  disabled={!form.date || assignmentsByTeacher.length === 0 || isSharing || isDownloading}
                  className="flex items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span aria-hidden="true">↗</span>
                  {isSharing ? "กำลังสร้าง..." : "แชร์"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  disabled={!form.date || assignmentsByTeacher.length === 0 || isSharing || isDownloading}
                  className="flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span aria-hidden="true">↓</span>
                  {isDownloading ? "กำลังบันทึก..." : "ดาวน์โหลด"}
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                ดาวน์โหลดเป็นไฟล์ PNG หรือแชร์ผ่านแอปในอุปกรณ์
              </p>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
