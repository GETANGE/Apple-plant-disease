const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({path: "../config.env"})

const sendMail = async function(options){

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 456,
        secure: true,
        auth: {
            user: 'emmanuelgetange48@gmail.com',
            pass: 'innczeugrmbkvneu'
        },
    });

    // define the email option
    const mailOptions = {
        from: 'emmanuelgetange48@gmail.com',
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