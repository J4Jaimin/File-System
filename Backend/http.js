import crypto from 'crypto';
import { readFile } from 'fs/promises';

// const hash = crypto.createHash('sha256').update(Buffer.from('Hello World')).digest('base64url');

// console.log(hash);

const fileData = await readFile('./http.js');

const newData = `blob ${fileData.length}\0${fileData}`;

const hash = crypto.createHash("sha1").update(newData).digest("hex");

console.log(hash);

