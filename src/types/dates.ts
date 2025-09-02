/**
 * Custom date types and helper functions for consistent date handling across the application
 */

// Branded type for formatted dates (YYYY-MM-DD HH:mm:ss)
export type FormattedDate = string & { __brand: 'FormattedDate' };

// Branded type for Unix timestamps (seconds since epoch)
export type UnixTimestamp = number & { __brand: 'UnixTimestamp' };

/**
 * Creates a formatted date string in the format: YYYY-MM-DD HH:mm:ss
 * @param date Optional Date object (defaults to current date/time)
 * @returns FormattedDate string
 */
export const createFormattedDate = (date: Date = new Date()): FormattedDate => {
    return date.toISOString().replace("T", " ").replace(/\..+/, "") as FormattedDate;
};

/**
 * Creates a Unix timestamp (seconds since epoch)
 * @param date Optional Date object (defaults to current date/time)
 * @returns UnixTimestamp number
 */
export const createUnixTimestamp = (date: Date = new Date()): UnixTimestamp => {
    return Math.floor(date.getTime() / 1000) as UnixTimestamp;
};

/**
 * Validates if a string is a properly formatted date
 * @param date String to validate
 * @returns boolean indicating if string matches YYYY-MM-DD HH:mm:ss format
 */
export const isFormattedDate = (date: string): date is FormattedDate => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return regex.test(date);
};

/**
 * Validates if a number is a proper Unix timestamp
 * @param timestamp Number to validate
 * @returns boolean indicating if number is a valid Unix timestamp
 */
export const isUnixTimestamp = (timestamp: number): timestamp is UnixTimestamp => {
    // Basic validation: must be a positive number that could reasonably be a Unix timestamp
    // (between 2020 and 2050 as a reasonable range)
    const min = 1577836800; // 2020-01-01
    const max = 2524608000; // 2050-01-01
    return Number.isInteger(timestamp) && timestamp >= min && timestamp <= max;
};
