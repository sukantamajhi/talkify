import nodemailer from "nodemailer";
import fs from "fs/promises";
import envConfig from "../utils/envConfig";
import handlebars from "handlebars";

const createTransporter = () => {
	return nodemailer.createTransport({
		host: envConfig.email_host, // Replace with your SMTP server
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: envConfig.email_user, // Replace with your email
			pass: envConfig.email_pass, // Replace with your email password
		},
	});
};

// Function to Compile Handlebars Template
export const compileTemplate = async (filePath: string, data: any) => {
	try {
		// Read the HTML file
		const htmlFile = await fs.readFile(filePath, "utf-8");

		// Compile Handlebars template
		const template = handlebars.compile(htmlFile);

		// Inject dynamic data
		return template(data);
	} catch (error) {
		console.error("Error compiling template:", error);
		throw error;
	}
};

interface ISendMail {
	to: string;
	subject: string;
	html: string;
}

const sendMail = async ({ to, subject, html }: ISendMail): Promise<void> => {
	const transporter = createTransporter();
	const mailOptions = {
		from: `"${envConfig.from_name}" <${envConfig.email_user}>`,
		to,
		subject,
		html,
	};

	try {
		transporter.sendMail(mailOptions);
		console.log("Email sent successfully");
	} catch (error) {
		console.error("Error sending email:", error);
	}
};

export default sendMail;
