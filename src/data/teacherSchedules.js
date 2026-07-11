import teacherLessons from "./teacherLessons.json";

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getDayKey(date) {
  if (!date) return null;
  return dayKeys[new Date(`${date}T00:00:00`).getDay()];
}

export const teacherSchedules = Object.fromEntries(
  Object.entries(teacherLessons).map(([teacher, schedule]) => [
    teacher,
    Object.fromEntries(
      Object.entries(schedule).map(([day, lessons]) => [
        day,
        lessons.map((lesson) => lesson.period),
      ])
    ),
  ])
);

export function getTeacherLessons(teacher, date) {
  const day = getDayKey(date);
  if (!teacher || !day) return [];
  return teacherLessons[teacher]?.[day] ?? [];
}

export function getAvailableTeachers(teacherList, date, periodValue, absentTeacher) {
  const period = Number(String(periodValue).match(/\d+/)?.[0]);
  if (!date || !period) return teacherList.filter((teacher) => teacher !== absentTeacher);

  const day = getDayKey(date);
  return teacherList.filter((teacher) => {
    if (teacher === absentTeacher) return false;
    return !(teacherSchedules[teacher]?.[day] ?? []).includes(period);
  });
}
