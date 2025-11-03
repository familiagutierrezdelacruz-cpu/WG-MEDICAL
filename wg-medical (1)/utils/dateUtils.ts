// FIX: Implemented the missing date utility functions, including `calculateAge`.

/**
 * Calculates a person's age and returns it as a formatted string.
 * For infants under 1, it returns months. Otherwise, it returns years.
 * @param dob The date of birth string in 'YYYY-MM-DD' format.
 * @returns A formatted string like "3 meses" or "5 años", or null if dob is invalid.
 */
export const calculateAge = (dob: string): string | null => {
  if (!dob) return null;
  // Add T00:00:00 to ensure date is parsed in local timezone
  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();

  // Handle future dates
  if (birthDate > today) return null;

  const totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  
  // Adjust for the day of the month. If today's date is less than birth date, a full month hasn't passed.
  let correctedMonths = totalMonths;
  if (today.getDate() < birthDate.getDate()) {
    correctedMonths--;
  }
  
  // If age is less than a year, return months
  if (correctedMonths < 12) {
    if (correctedMonths <= 0) return "0 meses";
    if (correctedMonths === 1) return "1 mes";
    return `${correctedMonths} meses`;
  }
  
  // Otherwise, return years
  const years = Math.floor(correctedMonths / 12);
  if (years === 1) return "1 año";
  return `${years} años`;
};

/**
 * Calculates a person's age in full years.
 * @param dob The date of birth string in 'YYYY-MM-DD' format.
 * @returns The age in years as a number, or 0 if the DOB is invalid or in the future.
 */
export const getAgeInYears = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age < 0 ? 0 : age;
};


/**
 * Parses a 'YYYY-MM-DD' date string in the local timezone, avoiding UTC conversion issues.
 * @param dateString The date string to parse.
 * @returns A Date object representing the local date.
 */
export const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};