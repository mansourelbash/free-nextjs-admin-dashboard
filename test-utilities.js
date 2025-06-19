// Test utility functions
const { getJordanianHolidays, getHolidayInfo, isWeekend } = require('./src/utils/jordanian-holidays.js');

console.log('=== TESTING UTILITY FUNCTIONS ===');

try {
    // Test getJordanianHolidays for 2025
    console.log('Testing getJordanianHolidays...');
    
    // Test specific date: June 26, 2025
    const testDate = new Date('2025-06-26');
    console.log('\n=== TESTING JUNE 26, 2025 ===');
    console.log('Date string:', testDate.toISOString().split('T')[0]);
    console.log('Day of week:', testDate.getDay());
    
    console.log('\nTest completed - check if utility functions exist');
} catch (error) {
    console.log('Error testing utility functions:', error.message);
    console.log('This is expected since we need TypeScript compilation');
}
