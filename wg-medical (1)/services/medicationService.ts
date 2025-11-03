// This service fetches a list of medications from a publicly published Google Sheet CSV URL.

export const fetchMedications = async (url: string): Promise<string[]> => {
    if (!url) {
      return [];
    }
  
    try {
      // Use a cache-busting parameter to ensure we get the latest version of the sheet.
      const cacheBustingUrl = `${url}&_=${new Date().getTime()}`;
      const response = await fetch(cacheBustingUrl);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const csvText = await response.text();
      
      // Parse CSV: split by new line, trim whitespace, filter out empty lines.
      // Assumes a single column of medication names.
      const medications = csvText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
  
      return medications;
    } catch (error) {
      console.error("Error fetching or parsing medication list:", error);
      // Return an empty array in case of an error to prevent app crashes.
      return [];
    }
  };
