const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWealcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'subrintakarmakar@gmail.com',
        subject: 'Thanks for joining Task-manager',
        text: `hi, ${name}, what is your plan with this app`
    })
}

const SendCancelationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'subrintakarmakar@gmail.com',
        subject: 'Your account From Task-manager is successfully deleted',
        text: `hi ${name}, Please let us know why you canclled your subscription`
    })
}
module.exports = {
    sendWealcomeEmail,
    SendCancelationEmail
}