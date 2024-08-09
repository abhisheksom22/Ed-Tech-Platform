const nodeMailer = require("nodemailer");

//function to send email
const mailSender = async (email,title,body)=>{
    try {
        //create transporter
        let transporter=nodeMailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });

        //sending email
        let info = await transporter.sendMail({
            from:"Udemy",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        });
        console.log(info);
        return info;
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = mailSender;
