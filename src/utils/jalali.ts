// Jalali calendar utilities with improved accuracy
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Improved Jalali conversion algorithm
export function gregorianToJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  
  let totalDays = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + 
                 Math.floor((gy + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  
  if (gm > 2) {
    const isLeap = ((gy % 4 === 0) && (gy % 100 !== 0)) || (gy % 400 === 0);
    if (isLeap) totalDays += 1;
  }
  
  let jy = -14;
  let jp = 0;
  
  // Calculate Jalali year
  while (jp < totalDays) {
    jy++;
    jp += isJalaliLeapYear(jy) ? 366 : 365;
  }
  
  if (jp > totalDays) {
    jy--;
    jp -= isJalaliLeapYear(jy) ? 366 : 365;
  }
  
  const remainingDays = totalDays - jp;
  
  let jm = 1;
  let jd = remainingDays;
  
  // Calculate month and day
  for (let i = 1; i <= 12; i++) {
    const daysInMonth = getDaysInJalaliMonth(jy, i);
    if (jd <= daysInMonth) {
      jm = i;
      break;
    }
    jd -= daysInMonth;
  }
  
  return { year: jy, month: jm, day: jd };
}

export function jalaliToGregorian(jalali: JalaliDate): Date {
  const { year: jy, month: jm, day: jd } = jalali;
  
  let totalDays = 0;
  
  // Add days for complete years
  for (let y = 1; y < jy; y++) {
    totalDays += isJalaliLeapYear(y) ? 366 : 365;
  }
  
  // Add days for complete months in current year
  for (let m = 1; m < jm; m++) {
    totalDays += getDaysInJalaliMonth(jy, m);
  }
  
  // Add remaining days
  totalDays += jd;
  
  // Convert to Gregorian (epoch: March 22, 622 CE)
  const baseDate = new Date(622, 2, 22); // March 22, 622
  const resultDate = new Date(baseDate.getTime() + (totalDays - 1) * 24 * 60 * 60 * 1000);
  
  return resultDate;
}

export function isJalaliLeapYear(year: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
    1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
  ];
  
  let jp = breaks[0];
  let jump = 0;
  for (let j = 1; j <= 19; j++) {
    const jm = breaks[j];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }
  
  let n = year - jp;
  
  if (n < jump) {
    if (jump - n < 6) n = n - jump + ((jump + 4) / 6) * 6;
    
    let leap = ((n + 1) % 33) % 4;
    if (jump === 33 && leap === 1) leap = 0;
    return leap === 1;
  }
  
  return false;
}

export function getDaysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

export function formatJalaliDate(date: Date, language: 'en' | 'fa'): string {
  if (language === 'fa') {
    try {
      // Use Intl.DateTimeFormat for proper Persian calendar formatting
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return formatter.format(date);
    } catch (error) {
      // Fallback to manual conversion if Intl fails
      const jalali = gregorianToJalali(date);
      return `${jalali.day} ${PERSIAN_MONTHS[jalali.month - 1]} ${jalali.year}`;
    }
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export function getJalaliMonths(): string[] {
  return PERSIAN_MONTHS;
}

export function getEnglishMonths(): string[] {
  return ENGLISH_MONTHS;
}