// Jordanian Public Holidays Utility
// Based on official Jordanian public holidays and Labor Law

interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'fixed' | 'variable'; // Fixed date or variable (e.g., Islamic holidays)
  description?: string;
}

// Fixed holidays that occur on the same date every year
const FIXED_HOLIDAYS_BASE: Omit<Holiday, 'date'>[] = [
  { name: 'New Year\'s Day', type: 'fixed', description: 'رأس السنة الميلادية' },
  { name: 'Labour Day', type: 'fixed', description: 'عيد العمال' },
  { name: 'Independence Day', type: 'fixed', description: 'عيد الاستقلال' },
  { name: 'Christmas Day', type: 'fixed', description: 'عيد الميلاد المجيد' },
  { name: 'Boxing Day (optional)', type: 'fixed', description: 'يوم الصندوق (اختياري)' }
];

// Fixed holidays with dates for specific years
const getFixedHolidays = (year: number): Holiday[] => [
  { ...FIXED_HOLIDAYS_BASE[0], date: `${year}-01-01` }, // New Year's Day
  { ...FIXED_HOLIDAYS_BASE[1], date: `${year}-05-01` }, // Labour Day  
  { ...FIXED_HOLIDAYS_BASE[2], date: `${year}-05-25` }, // Independence Day
  { ...FIXED_HOLIDAYS_BASE[3], date: `${year}-12-25` }, // Christmas Day
  { ...FIXED_HOLIDAYS_BASE[4], date: `${year}-12-26` }  // Boxing Day
];

// Islamic holidays (dates vary each year) - 2025 official verified dates from timeanddate.com
const ISLAMIC_HOLIDAYS_2025: Holiday[] = [
  { name: 'Al Isra\' wal Miraj', date: '2025-01-27', type: 'variable', description: 'الإسراء والمعراج' },
  { name: 'Ramadan begins', date: '2025-03-01', type: 'variable', description: 'بداية شهر رمضان' },
  { name: 'Eid al-Fitr Holiday', date: '2025-03-30', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Eid al-Fitr Day 1', date: '2025-03-31', type: 'variable', description: 'عيد الفطر - اليوم الأول' },
  { name: 'Eid al-Fitr Holiday', date: '2025-04-01', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Eid al-Fitr Holiday', date: '2025-04-02', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Eid al-Adha Holiday', date: '2025-06-05', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Day 1', date: '2025-06-06', type: 'variable', description: 'عيد الأضحى - اليوم الأول' },
  { name: 'Eid al-Adha Holiday', date: '2025-06-07', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Holiday', date: '2025-06-08', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Holiday', date: '2025-06-09', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Holiday', date: '2025-06-10', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Hijri New Year', date: '2025-06-26', type: 'variable', description: 'رأس السنة الهجرية' },
  { name: 'Prophet\'s Birthday', date: '2025-09-04', type: 'variable', description: 'المولد النبوي الشريف' }
];

// Islamic holidays (dates vary each year) - 2026 official verified dates  
const ISLAMIC_HOLIDAYS_2026: Holiday[] = [
  { name: 'Al Isra\' wal Miraj', date: '2026-01-16', type: 'variable', description: 'الإسراء والمعراج' },
  { name: 'Ramadan begins', date: '2026-02-19', type: 'variable', description: 'بداية شهر رمضان' },
  { name: 'Eid al-Fitr Day 1', date: '2026-03-20', type: 'variable', description: 'عيد الفطر - اليوم الأول' },
  { name: 'Eid al-Fitr Holiday', date: '2026-03-21', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Eid al-Fitr Holiday', date: '2026-03-22', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Eid al-Fitr Holiday', date: '2026-03-23', type: 'variable', description: 'عطلة عيد الفطر' },
  { name: 'Arafah Day', date: '2026-05-27', type: 'variable', description: 'يوم عرفة' },
  { name: 'Eid al-Adha Day 1', date: '2026-05-28', type: 'variable', description: 'عيد الأضحى - اليوم الأول' },
  { name: 'Eid al-Adha Holiday', date: '2026-05-29', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Holiday', date: '2026-05-30', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Eid al-Adha Holiday', date: '2026-05-31', type: 'variable', description: 'عطلة عيد الأضحى' },
  { name: 'Hijri New Year', date: '2026-06-16', type: 'variable', description: 'رأس السنة الهجرية' },
  { name: 'Prophet\'s Birthday', date: '2026-08-25', type: 'variable', description: 'المولد النبوي الشريف' }
];

// Christian holidays (Jordanian observance) - 2025 official dates
const CHRISTIAN_HOLIDAYS_2025: Holiday[] = [
  { name: 'Orthodox Palm Sunday', date: '2025-04-13', type: 'variable', description: 'أحد الشعانين الأرثوذكسي' },
  { name: 'Orthodox Good Friday', date: '2025-04-18', type: 'variable', description: 'الجمعة العظيمة الأرثوذكسية' },
  { name: 'Orthodox Easter Sunday', date: '2025-04-20', type: 'variable', description: 'أحد القيامة الأرثوذكسي' },
  { name: 'Orthodox Easter Monday', date: '2025-04-21', type: 'variable', description: 'إثنين القيامة الأرثوذكسي' },
  { name: 'Palm Sunday', date: '2025-04-13', type: 'variable', description: 'أحد الشعانين' },
  { name: 'Good Friday', date: '2025-04-18', type: 'variable', description: 'الجمعة العظيمة' },
  { name: 'Easter Sunday', date: '2025-04-20', type: 'variable', description: 'أحد القيامة' },
  { name: 'Easter Monday', date: '2025-04-21', type: 'variable', description: 'إثنين القيامة' }
};

// Christian holidays (Jordanian observance) - 2026 official dates
const CHRISTIAN_HOLIDAYS_2026: Holiday[] = [
  { name: 'Good Friday', date: '2026-04-03', type: 'variable', description: 'الجمعة العظيمة' },
  { name: 'Orthodox Good Friday', date: '2026-04-03', type: 'variable', description: 'الجمعة العظيمة الأرثوذكسية' },
  { name: 'Easter Sunday', date: '2026-04-05', type: 'variable', description: 'أحد القيامة' },
  { name: 'Orthodox Easter Sunday', date: '2026-04-05', type: 'variable', description: 'أحد القيامة الأرثوذكسي' },
  { name: 'Easter Monday', date: '2026-04-06', type: 'variable', description: 'إثنين القيامة' },
  { name: 'Orthodox Easter Monday', date: '2026-04-06', type: 'variable', description: 'إثنين القيامة الأرثوذكسي' }
];

// Combined holidays for 2025
const JORDANIAN_HOLIDAYS_2025: Holiday[] = [
  ...getFixedHolidays(2025),
  ...ISLAMIC_HOLIDAYS_2025,
  ...CHRISTIAN_HOLIDAYS_2025
];

// Combined holidays for 2026
const JORDANIAN_HOLIDAYS_2026: Holiday[] = [
  ...getFixedHolidays(2026),
  ...ISLAMIC_HOLIDAYS_2026,
  ...CHRISTIAN_HOLIDAYS_2026
];

// Function to get all holiday dates for a specific year
export const getJordanianHolidays = (year: number): string[] => {
  // Support for 2025 and 2026 with full data
  if (year === 2025) {
    return JORDANIAN_HOLIDAYS_2025.map(holiday => holiday.date);
  }
  
  if (year === 2026) {
    return JORDANIAN_HOLIDAYS_2026.map(holiday => holiday.date);
  }
  
  // For other years, return only the fixed holidays (adjusted for the year)
  return getFixedHolidays(year).map(holiday => holiday.date);
};

// Function to check if a date is a Jordanian public holiday
export const isJordanianHoliday = (date: Date): boolean => {
  const dateString = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const holidays = getJordanianHolidays(year);
  return holidays.includes(dateString);
};

// Function to check if a date is a weekend (Friday and Saturday in Jordan)
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
};

// Function to check if a date is a non-working day (weekend or holiday)
export const isNonWorkingDay = (date: Date): boolean => {
  return isWeekend(date) || isJordanianHoliday(date);
};

// Function to calculate working days between two dates (excluding weekends and holidays)
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!isNonWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Function to get holiday information for a specific date
export const getHolidayInfo = (date: Date): Holiday | null => {
  const dateString = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  
  // Check 2025 holidays
  if (year === 2025) {
    return JORDANIAN_HOLIDAYS_2025.find(holiday => holiday.date === dateString) || null;
  }
  
  // Check 2026 holidays
  if (year === 2026) {
    return JORDANIAN_HOLIDAYS_2026.find(holiday => holiday.date === dateString) || null;
  }
  
  // For other years, check only fixed holidays
  const fixedHolidays = getFixedHolidays(year);
  return fixedHolidays.find(holiday => holiday.date === dateString) || null;
};

// Function to get all holidays in a date range
export const getHolidaysInRange = (startDate: Date, endDate: Date): Holiday[] => {
  const holidays: Holiday[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const holidayInfo = getHolidayInfo(currentDate);
    if
