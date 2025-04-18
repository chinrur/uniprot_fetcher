"use server";

/**
 * Represents data fetched from the UniProt API.
 */
export interface UniProtData {
  /**
   * The UniProt accession ID.
   */
  accession: string;
  /**
   * The gene name.
   */
  geneName: string;
  /**
   * The protein name.
   */
  proteinName: string;
  /**
   * The species.
   */
  species: string;
}

/**
 * Asynchronously fetches data from the UniProt API for a given accession ID.
 *
 * @param accessionId The UniProt accession ID to query.
 * @returns A promise that resolves to a UniProtData object.
 */
export async function getUniProtData(accessionId: string): Promise<UniProtData> {
  const url = `https://rest.uniprot.org/uniprotkb/${accessionId}?format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Extract relevant information from the UniProt API response
    const geneName = data.primaryAccession; // Changed to primaryAccession
    const proteinName = data.proteinDescription?.recommendedName?.fullName?.value || 'N/A';
    const species = data.organism?.scientificName || 'N/A';

    return {
      accession: accessionId,
      geneName: geneName || 'N/A',
      proteinName: proteinName,
      species: species,
    };
  } catch (error) {
    console.error("Failed to fetch data from UniProt API:", error);
    throw error;
  }
}

/**
 * Fetches the sequence for a given UniProt accession ID.
 * @param accessionId The UniProt accession ID.
 * @returns The sequence as a string, or null if there was an error.
 */
export async function getUniProtSequence(accessionId: string): Promise<string | null> {
  const url = `https://rest.uniprot.org/uniprotkb/${accessionId}.fasta`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    // The sequence starts after the header line, so split the text and take the second part
    const sequence = text.split('\n').slice(1).join('');
    return sequence || null;
  } catch (error) {
    console.error("Failed to fetch sequence from UniProt API:", error);
    return null;
  }
}

