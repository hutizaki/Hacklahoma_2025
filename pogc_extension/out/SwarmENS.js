"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRecordingFiles = uploadRecordingFiles;
const axios_1 = require("axios");
const fs = require("fs");
/**
 * Uploads the specified recording file to your local Bee node.
 *
 * This function reads the file content (assumed to be JSON text) and sends
 * a POST request to the Bee HTTP API at http://localhost:1633/bzz.
 *
 * @param filePath The absolute path to the JSON recording file.
 * @returns A promise resolving to the Swarm reference (hash) returned by Bee.
 */
function uploadRecordingFiles(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // The local Bee node HTTP API endpoint (adjust if needed)
        const beeApiUrl = "http://localhost:1633/bzz";
        // Read file content as text.
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            // Send a POST request to Bee's API with the file content.
            const response = yield axios_1.default.post(beeApiUrl, fileContent, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            // Bee returns a JSON object with a "reference" property (the Swarm hash).
            return response.data.reference;
        }
        catch (error) {
            throw new Error(`Error uploading file to local Bee node: ${error}`);
        }
    });
}
//# sourceMappingURL=SwarmENS.js.map