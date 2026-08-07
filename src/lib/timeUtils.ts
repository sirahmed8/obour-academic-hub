import { LectureSlot, INITIAL_SCHEDULE } from "./scheduleConstants";

function parseTimeStr(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3]?.toUpperCase();

  if (hours === 12) hours = 0;
  if (modifier === "PM") hours += 12;

  return hours * 60 + minutes;
}

export function checkScheduleConflict(
  hagazDate: string,
  hagazTimeStr: string,
  schedule: LectureSlot[] = INITIAL_SCHEDULE
): LectureSlot | null {
  // hagazDate: YYYY-MM-DD
  const dateObj = new Date(hagazDate);
  const dayIndex = dateObj.getDay();
  // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
  const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNameEn = daysMap[dayIndex];

  // Parse Hagaz time interval "02:00 PM - 04:00 PM"
  const hagazParts = hagazTimeStr.split("-").map((s) => s.trim());
  if (hagazParts.length !== 2) return null;

  const hStart = parseTimeStr(hagazParts[0]);
  const hEnd = parseTimeStr(hagazParts[1]);

  for (const slot of schedule) {
    if (slot.dayEn.toLowerCase() === dayNameEn.toLowerCase()) {
      const slotParts = slot.time.split("-").map((s) => s.trim());
      if (slotParts.length === 2) {
        const sStart = parseTimeStr(slotParts[0]);
        const sEnd = parseTimeStr(slotParts[1]);

        // Check overlap
        if (hStart < sEnd && hEnd > sStart) {
          return slot; // Conflict found
        }
      }
    }
  }

  return null;
}
