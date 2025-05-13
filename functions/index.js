/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Install axios if not included: cd functions && npm install axios

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().email.user,
        pass: functions.config().email.pass
    }
});

exports.infermedicaProxy = functions.https.onCall(async (data, context) => {
  try {
    // Make request to Infermedica
    const response = await axios({
      method: data.method || 'POST',
      url: `https://api.infermedica.com/v3/${data.endpoint}`,
      headers: {
        'App-Id': functions.config().infermedica.app_id,
        'App-Key': functions.config().infermedica.app_key,
        'Content-Type': 'application/json'
      },
      data: data.payload
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Infermedica API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

exports.sendContactEmail = functions.https.onCall(async (data, context) => {
    const { name, email, phone, message } = data;

    const mailOptions = {
        from: functions.config().email.user,
        to: ['k230055@nu.edu.pk', 'k230074@nu.edu.pk'],
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Error sending email');
  }
});
