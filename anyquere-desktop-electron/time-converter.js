/**
 * Time Converter Module for anyQuere Desktop
 * Migrated from ceInstantTimeConverter project
 * Provides intelligent time zone conversion and parsing
 */

class TimeConverter {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

        // Known timezone offsets (standard time, no DST)
        this.offsets = {
            'UTC': 0,
            'GMT': 0,
            'EST': -5,
            'EDT': -4,
            'CST': -6,
            'CDT': -5,
            'MST': -7,
            'MDT': -6,
            'PST': -8,
            'PDT': -7,
            'AKST': -9,
            'AKDT': -8,
            'HST': -10,
            'CET': 1,
            'CEST': 2,
            'EET': 2,
            'EEST': 3,
            'MSK': 3,
            'IST': 5.5,
            'JST': 9,
            'KST': 9,
            'CST_CHINA': 8,
            'AEST': 10,
            'AEDT': 11,
            'NZST': 12,
            'NZDT': 13
        };

        // Default locations for conversion
        this.defaultLocations = [
            { name: 'Local Time', timezone: 'auto' },
            { name: 'UTC', timezone: 'UTC' },
            { name: 'New York', timezone: 'America/New_York' },
            { name: 'London', timezone: 'Europe/London' },
            { name: 'Paris', timezone: 'Europe/Paris' },
            { name: 'Tokyo', timezone: 'Asia/Tokyo' },
            { name: 'Sydney', timezone: 'Australia/Sydney' },
            { name: 'Los Angeles', timezone: 'America/Los_Angeles' },
            { name: 'Chicago', timezone: 'America/Chicago' },
            { name: 'Dubai', timezone: 'Asia/Dubai' }
        ];
    }

    /**
     * Parse time string from various formats
     */
    parseTime(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            return null;
        }

        // Clean the input
        const clean = timeString.trim();

        // Try different parsing methods in order of reliability
        const parsers = [
            this.parseISO8601.bind(this),
            this.parseUNIXTimestamp.bind(this),
            this.parseRFC2822.bind(this),
            this.parseUSDate.bind(this),
            this.parseEuropeanDate.bind(this),
            this.parseMonthDayYear.bind(this),
            this.parseNaturalLanguage.bind(this)
        ];

        for (const parser of parsers) {
            try {
                const result = parser(clean);
                if (result && !isNaN(result.getTime())) {
                    return result;
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Parse ISO 8601 format: 2025-10-15T14:30:00Z or 2025-10-15T14:30:00+08:00
     */
    parseISO8601(timeString) {
        const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
        if (!isoPattern.test(timeString)) {
            return null;
        }
        return new Date(timeString);
    }

    /**
     * Parse UNIX timestamps (seconds since epoch)
     */
    parseUNIXTimestamp(timeString) {
        const timestamp = parseInt(timeString);
        if (isNaN(timestamp)) return null;

        // Check if it's seconds or milliseconds
        const timestampStr = timestamp.toString();
        if (timestampStr.length === 10) {
            // Seconds
            return new Date(timestamp * 1000);
        } else if (timestampStr.length === 13) {
            // Milliseconds
            return new Date(timestamp);
        }

        return null;
    }

    /**
     * Parse RFC 2822 format: Tue, 15 Oct 2025 14:30:00 GMT
     */
    parseRFC2822(timeString) {
        return new Date(timeString);
    }

    /**
     * Parse US format: 10/15/2025 or 10/15/2025 2:30 PM
     */
    parseUSDate(timeString) {
        const usPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
        const match = timeString.match(usPattern);

        if (!match) return null;

        const [, month, day, year, hour, minute, second, ampm] = match;
        const date = new Date(year, month - 1, day);

        if (hour) {
            let h = parseInt(hour);
            const m = parseInt(minute || 0);
            const s = parseInt(second || 0);

            if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) {
                h += 12;
            } else if (ampm && ampm.toUpperCase() === 'AM' && h === 12) {
                h = 0;
            }

            date.setHours(h, m, s, 0);
        }

        return date;
    }

    /**
     * Parse European format: 15.10.2025 or 15.10.2025 14:30
     */
    parseEuropeanDate(timeString) {
        const euPattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
        const match = timeString.match(euPattern);

        if (!match) return null;

        const [, day, month, year, hour, minute, second] = match;
        const date = new Date(year, month - 1, day);

        if (hour) {
            const h = parseInt(hour);
            const m = parseInt(minute || 0);
            const s = parseInt(second || 0);
            date.setHours(h, m, s, 0);
        }

        return date;
    }

    /**
     * Parse month day year format: October 15, 2025
     */
    parseMonthDayYear(timeString) {
        const monthDayPattern = /^(\w+)\s+(\d{1,2}),?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
        const match = timeString.match(monthDayPattern);

        if (!match) return null;

        const [, monthName, day, year, hour, minute, second, ampm] = match;
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const month = months.findIndex(m => monthName.toLowerCase().startsWith(m));

        if (month === -1) return null;

        const date = new Date(year, month, parseInt(day));

        if (hour) {
            let h = parseInt(hour);
            const m = parseInt(minute || 0);
            const s = parseInt(second || 0);

            if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) {
                h += 12;
            } else if (ampm && ampm.toUpperCase() === 'AM' && h === 12) {
                h = 0;
            }

            date.setHours(h, m, s, 0);
        }

        return date;
    }

    /**
     * Parse natural language time expressions
     */
    parseNaturalLanguage(timeString) {
        const lower = timeString.toLowerCase();
        const now = new Date();

        // Today, tomorrow, yesterday
        if (lower.includes('today')) {
            return now;
        } else if (lower.includes('tomorrow')) {
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow;
        } else if (lower.includes('yesterday')) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return yesterday;
        }

        // Time only: "2:30 PM", "14:30"
        const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i;
        const timeMatch = timeString.trim().match(timePattern);

        if (timeMatch) {
            const [, hour, minute, second, ampm] = timeMatch;
            let h = parseInt(hour);
            const m = parseInt(minute);
            const s = parseInt(second || 0);

            if (ampm) {
                if (ampm.toLowerCase() === 'pm' && h !== 12) h += 12;
                if (ampm.toLowerCase() === 'am' && h === 12) h = 0;
            }

            const date = new Date(now);
            date.setHours(h, m, s, 0);
            return date;
        }

        return null;
    }

    /**
     * Get timezone offset for a given timezone
     */
    getTimezoneOffset(timezone) {
        if (timezone === 'auto') {
            return -(new Date().getTimezoneOffset() / 60);
        }

        // Direct lookup
        if (this.offsets[timezone] !== undefined) {
            return this.offsets[timezone];
        }

        // UTC offset format parsing (UTC+7, UTC-5:30)
        if (timezone.startsWith('UTC')) {
            return this.parseUTCOffset(timezone);
        }

        // Try using Intl API (fallback)
        try {
            const date = new Date();
            const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            const targetDate = new Date(utc);

            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const parts = formatter.formatToParts(targetDate);
            const targetHours = parseInt(parts.find(p => p.type === 'hour').value);
            const targetMinutes = parseInt(parts.find(p => p.type === 'minute').value);

            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), targetHours, targetMinutes);
            return (localDate.getTime() - date.getTime()) / (1000 * 60 * 60);
        } catch (error) {
            console.warn('Could not determine timezone offset for:', timezone);
            return 0;
        }
    }

    /**
     * Parse UTC offset format: UTC+7, UTC-5:30
     */
    parseUTCOffset(timezone) {
        const match = timezone.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
        if (!match) return 0;

        const [, sign, hours, minutes] = match;
        let offset = parseInt(hours);

        if (minutes) {
            offset += parseInt(minutes) / 60;
        }

        return sign === '+' ? offset : -offset;
    }

    /**
     * Check if a date is in Daylight Saving Time for a timezone
     */
    isDaylightSavingTime(date, timezone) {
        try {
            const year = date.getFullYear();
            const janDate = new Date(year, 0, 1);
            const julDate = new Date(year, 6, 1);

            const janOffset = this.getTimezoneOffsetForDate(janDate, timezone);
            const julOffset = this.getTimezoneOffsetForDate(julDate, timezone);
            const currentOffset = this.getTimezoneOffsetForDate(date, timezone);

            return currentOffset === Math.max(janOffset, julOffset) && janOffset !== julOffset;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get timezone offset for a specific date
     */
    getTimezoneOffsetForDate(date, timezone) {
        try {
            const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            const targetDate = new Date(utc);

            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const parts = formatter.formatToParts(targetDate);
            const targetHours = parseInt(parts.find(p => p.type === 'hour').value);
            const targetMinutes = parseInt(parts.find(p => p.type === 'minute').value);

            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), targetHours, targetMinutes);
            return (localDate.getTime() - date.getTime()) / (1000 * 60 * 60);
        } catch (error) {
            return this.getTimezoneOffset(timezone);
        }
    }

    /**
     * Convert time to multiple timezones
     */
    convertToMultipleTimezones(date, locations = null) {
        if (!date || isNaN(date.getTime())) {
            return [];
        }

        const targetLocations = locations || this.defaultLocations;
        const results = [];

        for (const location of targetLocations) {
            try {
                const offset = this.getTimezoneOffsetForDate(date, location.timezone);
                const convertedDate = new Date(date.getTime() + (offset * 60 * 60 * 1000));
                const isDST = this.isDaylightSavingTime(date, location.timezone);

                results.push({
                    name: location.name,
                    timezone: location.timezone,
                    date: convertedDate,
                    offset: offset,
                    isDST: isDST,
                    formatted: this.formatTime(convertedDate, location.timezone)
                });
            } catch (error) {
                console.warn('Failed to convert time for location:', location.name, error);
            }
        }

        return results;
    }

    /**
     * Format time with timezone information
     */
    formatTime(date, timezone) {
        try {
            const options = {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: timezone === 'auto' ? undefined : timezone,
                timeZoneName: 'short'
            };

            return date.toLocaleString('en-US', options);
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Convert time to different formats
     */
    getMultipleFormats(date) {
        if (!date || isNaN(date.getTime())) {
            return {};
        }

        return {
            iso8601: date.toISOString(),
            unix: Math.floor(date.getTime() / 1000),
            unixMs: date.getTime(),
            rfc2822: date.toUTCString(),
            local: date.toLocaleString(),
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        };
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = TimeConverter;