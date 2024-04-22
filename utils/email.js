const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({path: "../config.env"})

const sendMail = async function(options){

    const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
        }
    });

    // define the email option
    const mailOptions = {
        from: 'Scab-Classifier <scab-classifier@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    transporter.sendMail(mailOptions, (err, result) => {
        if(err){
            console.log(err);
        }else{
            console.log("Email sent to :"+result);
        }
    })
}

module.exports = sendMail;