import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); 

const sendMail = async (email, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your Name <aditya@gmail.com>",
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, message: "Error sending email" };
    }

    console.log("Email sent:", data);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error sending email" };
  }
};

export default sendMail;
