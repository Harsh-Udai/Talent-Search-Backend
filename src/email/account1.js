const mailjet = require ('node-mailjet')
.connect('dcf3cdf7495052476415137ec4f062ed', '31e9b90bb97fec735b60df60ce994857')
// const request = mailjet
// .post("send", {'version': 'v3.1'})
// .request({
//   "Messages":[
//     {
//       "From": {
//         "Email": "harshudai2021@gmail.com",
//         "Name": "Harsh"
//       },
//       "To": [
//         {
//           "Email": "harshudai2021@gmail.com",
//           "Name": "Harsh"
//         }
//       ],
//       "Subject": "Greetings from Mailjet.",
//       "TextPart": "My first Mailjet email",
//       "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
//       "CustomID": "AppGettingStartedTest"
//     }
//   ]
// })

// request
//   .then((result) => {
//     console.log(result.body)
//   })
//   .catch((err) => {
//     console.log(err.statusCode)
//   })


function sendWelcomeEmail(recipient,otp) {
        return mailjet
        .post("send", { version: "v3.1" })
        .request({
        Messages: [
            {
            From: {
                Email: "harshudai2021@gmail.com",
                Name: "Harsh Udai",
            },
            To: [
                {
                Email: recipient,
                },
            ],
            Subject: "Welcome to Talent Search",
            TextPart: "The OTP for your account is: ",
            HTMLPart: `${otp}`,
            },
        ],
        })
        .then((result) => {
        // do something with the send result or ignore
        console.log(result);
        })
        .catch((err) => {
        // handle an error
        console.log(err);
        });
}

function securityM(recipient,otp) {
    return mailjet
    .post("send", { version: "v3.1" })
    .request({
    Messages: [
        {
        From: {
            Email: "harshudai2021@gmail.com",
            Name: "Harsh Udai",
        },
        To: [
            {
            Email: recipient,
            },
        ],
        Subject: "This is yours Security token",
        TextPart: "The OTP for your account is: ",
        HTMLPart: `${otp}`,
        },
    ],
    })
    .then((result) => {
    // do something with the send result or ignore
    console.log(result);
    })
    .catch((err) => {
    // handle an error
    console.log(err);
    });
}

module.exports={
    sendWelcomeEmail,
    securityM
}