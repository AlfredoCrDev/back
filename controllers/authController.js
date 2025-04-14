const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const TWILIO_CONVERSATION_SERVICE_SID = process.env.TWILIO_CONVERSATION_SERVICE_SID;

const getToken = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { user_identity, room_name, create_conversation } = req.body;

      if (!user_identity || !room_name) {
        return res.status(400).json({
          error: 'user_identity y room_name son requeridos',
        });
      }

      const AccessToken = twilio.jwt.AccessToken;
      const VideoGrant = AccessToken.VideoGrant;
      const ChatGrant = AccessToken.ChatGrant;

      const token = new AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        { identity: user_identity }
      );
      // Se agrega el permiso de video
      token.addGrant(new VideoGrant({ room: room_name }));
      
      const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
        accountSid: TWILIO_ACCOUNT_SID,
      });

      try {
        await client.video.v1.rooms(room_name).fetch();
      } catch (err) {
        if (err.status === 404) {
          await client.video.v1.rooms.create({
            uniqueName: room_name,
            type: 'peer-to-peer',
            recordParticipantsOnConnect: false,
          });
        } else {
          throw err;
        }
      }
      // Se crea chat si es solicitado y se tiene el SID del servicio
      if (create_conversation && TWILIO_CONVERSATION_SERVICE_SID) {
        let conversation;
        try {
          conversation = await client.conversations.v1.conversations(room_name).fetch();
        } catch (e) {
          if (e.status === 404) {
            conversation = await client.conversations.v1.conversations.create({
              uniqueName: room_name,
              friendlyName: room_name,
            });
          } else {
            throw e;
          }
        }

        // Añadir participante
        try {
          await client.conversations.v1.conversations(conversation.sid).participants.create({
            identity: user_identity,
          });
        } catch (e) {
          // Evitar error si ya existe el participante
          if (e.code !== 50433) throw e;
        }

        token.addGrant(
          new ChatGrant({ serviceSid: TWILIO_CONVERSATION_SERVICE_SID })
        );
      }

      return res.json({
        token: token.toJwt(),
        room_type: 'peer-to-peer',
      });
    }
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getToken };
