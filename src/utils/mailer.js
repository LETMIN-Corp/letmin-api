const nodemailer = require('nodemailer');

require('dotenv').config();

const sendEmail = async (options, callback) => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Letmin <',
		to: options.email,
		subject: options.subject,
		text: options.message,
		html: options.html || '',
		attachments: options.attachments,

	};

	// 3) Actually send the email
	return transporter.sendMail(mailOptions, callback);
};

module.exports = sendEmail;