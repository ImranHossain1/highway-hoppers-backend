import { WeekDays } from '@prisma/client';

export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error('Expected and array');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const hasTimeConflict = (
  existingSlots: {
    startTime: string;
    endTime: string;
    dayOfWeek: WeekDays;
    startDate: string;
    endDate: string;
    status: string;
  }[],
  newSlot: {
    startTime: string;
    endTime: string;
    dayOfWeek: WeekDays;
    startDate: string;
    endDate: string;
  }
) => {
  for (const slot of existingSlots) {
    const existingStart = new Date(`${slot.startDate}T${slot.startTime}:00`);
    const existingEnd = new Date(`${slot.endDate}T${slot.endTime}:00`);
    const newStart = new Date(`${newSlot.startDate}T${newSlot.startTime}:00`);
    const newEnd = new Date(`${newSlot.endDate}T${newSlot.endTime}:00`);

    if (
      newStart < existingEnd &&
      newEnd > existingStart &&
      (slot.status === 'Upcoming' || slot.status === 'Ongoing')
    ) {
      return true;
    }
  }
  return false;
};
