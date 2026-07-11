export const teacherSchedules = {
  "คุณครูนัทลียา": { monday: [1, 2, 3, 4, 6], tuesday: [1, 2, 4, 6], wednesday: [1, 2, 3, 6], thursday: [1, 3, 4, 5], friday: [1, 2, 3, 4, 6] },
  "คุณครูโอวาท": { monday: [1, 2, 6], tuesday: [1, 2, 3, 4, 5, 6], wednesday: [1, 3, 4, 6], thursday: [1, 2, 3], friday: [1, 3, 4, 5, 6] },
  "คุณครูสุไหวย๊ะ": { monday: [1, 2, 4, 5, 6, 7], tuesday: [6], wednesday: [1, 2, 4, 5, 6], thursday: [1, 4, 5, 6], friday: [1, 2, 3, 4] },
  "คุณครูสุนิดา": { monday: [1, 2, 3, 4, 6], tuesday: [2], wednesday: [1, 2, 3, 4, 5, 6], thursday: [2, 3], friday: [1, 2, 3, 4, 5, 6] },
  "คุณครูธัญญลักษณ์": { monday: [1, 2, 3, 6], tuesday: [1, 2, 3, 4, 5, 6], wednesday: [1, 2, 3, 4, 6], thursday: [1, 2, 4, 5], friday: [2, 4, 6] },
  "คุณครูศศิวิมล": { monday: [2, 4, 5, 6], tuesday: [2, 5, 6], wednesday: [1, 2, 4, 6], thursday: [1, 2, 3, 4, 5], friday: [1, 2, 3, 6] },
  "คุณครูชวนพิศ": { monday: [4, 5], tuesday: [1, 4, 5], wednesday: [1, 2, 3, 4, 5], thursday: [1, 2, 3, 5, 6, 7], friday: [1, 2, 3] },
  "คุณครูจีราพร": { monday: [1, 3, 4, 6], tuesday: [2, 3, 4, 6], wednesday: [1, 2, 3, 4, 5, 6], thursday: [1, 4, 5, 6], friday: [1, 3, 4, 5, 6] },
  "คุณครูสิรินันท์": { monday: [1, 4, 5, 6], tuesday: [1, 2, 4], wednesday: [2, 3, 4, 5], thursday: [1, 2, 3, 4, 5, 6], friday: [1, 2, 4, 5, 6] },
  "คุณครูณฐกานต์": { monday: [1, 3, 4], tuesday: [1, 3, 4, 5, 6], wednesday: [2, 4, 5, 6], thursday: [1, 2, 4], friday: [1, 2, 3, 4, 5, 6] },
  "คุณครูอรุณี": { monday: [2, 3, 4, 5, 6], tuesday: [1, 4, 5, 6], wednesday: [2, 6], thursday: [1, 2, 3, 4, 5, 6], friday: [1, 2, 4, 5, 6] },
  "คุณครูธันยากร": { monday: [1, 2, 4, 5], tuesday: [1, 3, 5, 6], wednesday: [1, 5, 6], thursday: [1, 2, 4, 5, 6], friday: [2, 5, 6] },
  "คุณครูธนพงษ์": { monday: [1, 3, 4, 5], tuesday: [4, 6], wednesday: [1, 3, 4, 5, 6], thursday: [1, 2, 3, 4], friday: [2, 3, 4, 5, 6] },
  "คุณครูพงศพัฒน์": { monday: [2, 3, 4, 5, 6], tuesday: [2, 3, 4, 5, 6], wednesday: [2, 3, 4, 5, 6], thursday: [1, 4, 5, 6], friday: [1, 4, 5, 6] },
  "คุณครูจันทร์จิรา": { monday: [1, 2, 3, 4, 5], tuesday: [1, 2, 3, 6], wednesday: [2, 4, 6], thursday: [1, 2, 3, 4], friday: [1, 3, 4, 6] },
  "คุณครูนุชรี": { monday: [1, 2, 6], tuesday: [1, 2, 3, 5, 6], wednesday: [2, 3, 5, 6], thursday: [1, 2], friday: [5, 6] },
};

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function getAvailableTeachers(teacherList, date, periodValue, absentTeacher) {
  const period = Number(String(periodValue).match(/\d+/)?.[0]);
  if (!date || !period) return teacherList.filter((teacher) => teacher !== absentTeacher);

  const day = dayKeys[new Date(`${date}T00:00:00`).getDay()];
  return teacherList.filter((teacher) => {
    if (teacher === absentTeacher) return false;
    return !(teacherSchedules[teacher]?.[day] ?? []).includes(period);
  });
}
