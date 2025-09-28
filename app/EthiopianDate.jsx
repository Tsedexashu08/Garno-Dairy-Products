// utils/ethiopianDateAmharic.js
export const getEthiopianDateWithAmharic = (gregorianDate = new Date()) => {
    const date = new Date(gregorianDate);
    
    // Convert to Ethiopian date
    const ethYear = date.getFullYear() - 7;
    let ethMonth = date.getMonth() + 6;
    let ethDay = date.getDate()-10;
    
    // Adjust month if needed
    if (ethMonth > 13) {
        ethMonth -= 13;
    }
    
    // Get day of week in Amharic
    const dayOfWeek = date.getDay();
    const amharicDays = [
        'ሰኞ', // Monday
        'ማክሰኞ', // Tuesday
        'ረቡዕ', // Wednesday
        'ሐሙስ', // Thursday
        'ዓርብ', // Friday
        'ቅዳሜ', // Saturday
        'እሑድ'  // Sunday
    ];
    
    // Amharic month names
    const amharicMonths = [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 
        'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 
        'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጷጉሜ'
    ];
    
    const amharicDay = amharicDays[dayOfWeek-1];
    const amharicMonth = amharicMonths[ethMonth - 1];
    
    return {
        fullDate: `${amharicDay} -  ${amharicMonth} ${ethDay}  ${ethYear}`,
        day: amharicDay,
        dayNumber: ethDay,
        month: amharicMonth,
        monthNumber: ethMonth,
        year: ethYear,
        numeric: `${ethDay}/${ethMonth}/${ethYear}`
    };
};

// Usage example
// const todayEthiopian = getEthiopianDateWithAmharic();
// console.log(todayEthiopian.fullDate); // "ማክሰኞ፣ 6 ሚያዝያ 2016"

export default getEthiopianDateWithAmharic;