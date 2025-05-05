import crypto from 'crypto';
import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';

// const hash = crypto.createHash('sha256').update(Buffer.from('Hello World')).digest('base64url');

// console.log(hash);

// const fileData = await readFile('./http.js');

// const newData = `blob ${fileData.length}\0${fileData}`;

// const hash = crypto.createHash("sha1").update(newData).digest("hex");

// console.log(hash);

// const token = jwt.sign({
//     name: 'Jai'
// }, 'secret', {
//     algorithm: 'HS256',
//     expiresIn: 10
// });

// console.log(token);

// const data = Buffer.from("4VMaEAaF3waU2Wj1UfO2fS1UEM4ealE4Q7XXuHqwLP8", "base64url").toString();

// const signature = crypto.createHmac("sha256", "secret").update("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFpIiwiaWF0IjoxNzQ2NDI5MDAxfQ").digest("base64url");

// console.log(signature);

// const verification = jwt.decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFpIiwiaWF0IjoxNzQ2NDI5NjMxLCJleHAiOjE3NDY0Mjk2NDF9.hBJB74eCbTyFvDpbvURfSGdgsZNhc70RqWu--jkmFKU",
//     "secret"
// );

// console.log(verification);
