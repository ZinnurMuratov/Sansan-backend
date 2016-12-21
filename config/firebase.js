var FCM = require('fcm-push');

var serverKey = 'AAAAanEg9JA:APA91bHqb-ZWDVZBD1IJ0lYt3fnxZQPWhZQJwO9qKeDkLBtpDtxTd_j2sW9qQLQ9Ul8iGaj6DInjfSmD2uvZj1Fi9O0C-YlJEQ1RA0IMjnSBOPqT8-1mygKUYPIdvBHMv2CevT8SCHUoriz5mbI0DySuasAZD6PLQQ';
var fcm = new FCM(serverKey);

module.exports = fcm;

var message = {
    to: 'registration_token_or_topics',
    collapse_key: 'your_collapse_key',
    data: {
        your_custom_data_key: 'your_custom_data_value'
    },
    notification: {
        title: 'Title of your push notification',
        body: 'Body of your push notification'
    }
};

//callback style
// fcm.send(message, function(err, response){
//     if (err) {
//         console.log("Something has gone wrong!");
//     } else {
//         console.log("Successfully sent with response: ", response);
//     }
// });
//
// //promise style
// fcm.send(message)
//     .then(function(response){
//         console.log("Successfully sent with response: ", response);
//     })
//     .catch(function(err){
//         console.log("Something has gone wrong!");
//         console.error(err);
//     })