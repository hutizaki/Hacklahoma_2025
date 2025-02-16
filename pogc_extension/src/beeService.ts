import * as vscode from 'vscode';

/**
 * Uploads content to your Bee node via its HTTP API.
 *
 * This function reads the Bee API URL from the VS Code configuration
 * (under the key "pogc.beeApiUrl", defaulting to "http://localhost:1633").
 * It then sends a POST request to the Bee endpoint ("/bzz") with the given content.
 *
 * @param content The string content you wish to upload.
 * @returns A promise that resolves to the JSON response from the Bee node.
 */
export async function uploadContentToBee(content: string): Promise<any> {
  // Get the Bee API URL from your extension settings
  const config = vscode.workspace.getConfiguration('pogc');
  const beeApiUrl = config.get<string>('beeApiUrl', 'http://localhost:1633');

  // Define the endpoint for uploading content (default Bee endpoint)
  const endpoint = `${beeApiUrl}/bzz`;

  try {
    // Send a POST request to the Bee node with the content as the body.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain"  // Use the appropriate MIME type for your content
      },
      body: content
    });

    // Throw an error if the response is not OK (non-2xx status)
    if (!response.ok) {
      throw new Error(`Bee API responded with status: ${response.status}`);
    }

    // Parse the JSON response and return it.
    const data = await response.json();
    vscode.window.showInformationMessage(`Content uploaded! Swarm reference: ${data.reference}`);
    return data;
  } catch (error) {
    vscode.window.showErrorMessage(`Error uploading content to Bee: ${error}`);
    console.error("Upload error:", error);
    throw error;
  }
}
