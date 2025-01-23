import path from 'path';
import fs from 'fs';

const metadataPath = path.join(import.meta.dirname, "filesdata.json");

let metadata = {};

if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath));
} else {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
}

export { metadata, metadataPath };