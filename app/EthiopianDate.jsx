import { toEthiopian } from 'ethiopian-calendar-new';

/**
 * Converts a Gregorian Date object to its Ethiopian Calendar equivalent
 * and returns the date components with Amharic names.
 *
 * @param {Date|string} gregorianDate - The Gregorian date (defaults to today).
 * @returns {object} An object containing the Ethiopian date components.
 */
export const getEthiopianDateWithAmharic = (gregorianDate = new Date()) => {
    const date = new Date(gregorianDate);

    // 1. Get Gregorian Year, Month (0-indexed), and Day
    const gYear = date.getFullYear();
    // getMonth() is 0-indexed (0=Jan, 11=Dec), but the library expects 1-indexed
    const gMonth = date.getMonth() + 1; 
    const gDay = date.getDate();

    // 2. Convert to Ethiopian date using the library
    // toEthiopian(year, month, day) returns { year, month, day }
    const ethDateObj = toEthiopian(gYear, gMonth, gDay);

    const ethYear = ethDateObj.year;
    const ethMonth = ethDateObj.month; // 1-indexed (1=መስከረም, 13=ጳጉሜ)
    const ethDay = ethDateObj.day;

    // 3. Amharic Month Names (1-indexed based on month number)
    // NOTE: Array is now 14 elements long, with index 0 being a placeholder,
    // or we adjust the index lookup. Since month numbers are 1-13, a 0-indexed
    // array of 13 months requires ethMonth - 1.
    const amharicMonths = [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ',
        'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ',
        'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጷጉሜ'
    ];

    // 4. Correct Day of Week in Amharic
    // getDay() returns 0 for Sunday, 1 for Monday... 6 for Saturday.
    const dayOfWeekIndex = date.getDay();
    const amharicDays = [
        'እሑድ',    // 0: Sunday
        'ሰኞ',     // 1: Monday
        'ማክሰኞ',  // 2: Tuesday
        'ረቡዕ',    // 3: Wednesday
        'ሐሙስ',    // 4: Thursday
        'ዓርብ',    // 5: Friday
        'ቅዳሜ'    // 6: Saturday
    ];

    const amharicDay = amharicDays[dayOfWeekIndex];
    const amharicMonth = amharicMonths[ethMonth - 1]; // Use month number (1-13) to access 0-indexed array

    // 5. Return the structured object
    return {
        // The common Ethiopian date format is: DayOfWeek, Day Month Year
        fullDate: `${amharicDay}፣ ${ethDay} ${amharicMonth} ${ethYear}`,
        day: amharicDay,
        dayNumber: ethDay,
        month: amharicMonth,
        monthNumber: ethMonth,
        year: ethYear,
        numeric: `${ethDay}/${ethMonth}/${ethYear}`
    };
};

export default getEthiopianDateWithAmharic;