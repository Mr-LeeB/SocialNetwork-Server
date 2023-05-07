const PusherServer = require('pusher');
// const PusherClient = require('pusher-js');

const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'ap1',
  useTLS: true,
});

// const pusherClient = new PusherClient(process.env.PUSHER_APP_KEY, {
//   channelAuthorization: {
//     endpoint: '/api/pusher/auth',
//     transport: 'ajax',
//   },
//   cluster: 'ap1',
// });

module.exports = { pusherServer /*, pusherClient */ };
