// Debug script for 2025 Hijri New Year styling issue
console.log('=== DEBUGGING 2025 HIJRI NEW YEAR ===');

// Test date: June 26, 2025 (should be Hijri New Year)
const testDate = new Date('2025-06-26');
console.log('Test date:', testDate);
console.log('Date string:', testDate.toISOString().split('T')[0]);

// Check if it's in our holiday data
const holidays2025 = [
  // Fixed National Holidays
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-05-01', name: 'Labour Day' },
  { date: '2025-05-25', name: 'Independence Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day (optional)' },
  
  // Islamic Holidays (2025 Official Verified Dates)
  { date: '2025-01-27', name: 'Al Isra\' wal Miraj (Night Journey)' },
  { date: '2025-03-01', name: 'Ramadan begins' },
  { date: '2025-03-30', name: 'Eid al-Fitr Holiday' },
  { date: '2025-03-31', name: 'Eid al-Fitr Day 1' },
  { date: '2025-04-01', name: 'Eid al-Fitr Holiday' },
  { date: '2025-04-02', name: 'Eid al-Fitr Holiday' },
  { date: '2025-06-05', name: 'Eid al-Adha Holiday' },
  { date: '2025-06-06', name: 'Eid al-Adha Day 1' },
  { date: '2025-06-07', name: 'Eid al-Adha Holiday' },
  { date: '2025-06-08', name: 'Eid al-Adha Holiday' },
  { date: '2025-06-09', name: 'Eid al-Adha Holiday' },
  { date: '2025-06-10', name: 'Eid al-Adha Holiday' },
  { date: '2025-06-26', name: 'Hijri New Year (Islamic New Year)' },
  { date: '2025-09-04', name: 'Prophet\'s Birthday (Mawlid)' },
];

const holidayMap = new Map(holidays2025.map(h => [h.date, h.name]));
const dateStr = testDate.toISOString().split('T')[0];

console.log('Looking for date in map:', dateStr);
console.log('Found in map:', holidayMap.has(dateStr));
console.log('Holiday name:', holidayMap.get(dateStr));

// Check all June 2025 holidays
console.log('\n=== ALL JUNE 2025 HOLIDAYS ===');
holidays2025.filter(h => h.date.startsWith('2025-06')).forEach(h => {
  console.log(`${h.date}: ${h.name}`);
});
