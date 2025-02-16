import axios from 'axios';
import * as fs from 'fs';

/**
 * Uploads the specified recording file to your local Bee node.
 * 
 * This function reads the file content (assumed to be JSON text) and sends
 * a POST request to the Bee HTTP API at http://localhost:1633/bzz.
 * 
 * @param filePath The absolute path to the JSON recording file.
 * @returns A promise resolving to the Swarm reference (hash) returned by Bee.
 */
export async function uploadRecordingFiles(filePath: string): Promise<string> {
  // The local Bee node HTTP API endpoint (adjust if needed)
  const beeApiUrl = "http://localhost:1633/bzz";
  
  // Read file content as text.
  const fileContent = fs.readFileSync(filePath, 'utf8');

  try {
    // Send a POST request to Bee's API with the file content.
    const response = await axios.post(beeApiUrl, fileContent, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    // Bee returns a JSON object with a "reference" property (the Swarm hash).
    return response.data.reference;
  } catch (error) {
    throw new Error(`Error uploading file to local Bee node: ${error}`);
  }
}
