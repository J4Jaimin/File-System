import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: "jaiminrana1102@gmail.com",
        pass: "quci lsws dmpb pbwp",
    },
});

const info = await transporter.sendMail({
    from: '"Jaimin Rana" <jaiminrana1102@gmail.com>',
    to: "jaiminrana1109@gmail.com",
    subject: "Msg from Jaimin Rana.",
    html: "<b><h2> Hello Jaimin Rana,</h2></b>"
})

console.log("Message sent: %s", info.messageId);


// import bcrypt from 'bcrypt';
// import fs from 'fs';
// import crypto from 'crypto';

// const filePath = '/home/jaiminrana/Music/resumes/Jaimin_resume.pdf'; // <-- apna file path daal

// // Step 1: Read file
// const fileBuffer = fs.readFileSync(filePath);
// const fileContent = fileBuffer.toString(); // convert binary to string

// const saltRounds = 10;

// bcrypt.hash(fileContent, saltRounds, (err, hash) => {
//     if (err) {
//         console.error('Error hashing file:', err);
//         return;
//     }
//     console.log('Bcrypt hash of file:', hash);
// });

// const hash = crypto.createHash('MD5').update(fileContent).digest('hex');

// console.log('MD5 hash of file:', hash);


