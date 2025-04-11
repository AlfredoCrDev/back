const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

const getToken = (req, res) => {
  if (req.method === 'POST') {
    const { user_identity, room_name, create_conversation } = req.body;

    if (!user_identity || !room_name) {
      return res.status(400).json({
        error: 'user_identity y room_name son requeridos',
      });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: user_identity }
    );

    const videoGrant = new VideoGrant({
      room: room_name,
    });
    token.addGrant(videoGrant);

    res.json({
      token: token.toJwt(),
      room_type: 'peer-to-peer',
    });
  } else {
    const { idUser, idRequest } = req.query;

    if (!idUser || !idRequest) {
      return res.status(400).json({
        error: 'idUser e idRequest son requeridos',
      });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: idUser }
    );

    const room = `room${idRequest}`;
    const videoGrant = new VideoGrant({
      room,
    });
    token.addGrant(videoGrant);

    res.json({
      token: token.toJwt(),
      room,
    });
  }
};

module.exports = { getToken };