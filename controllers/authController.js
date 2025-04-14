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
      
      // Se agrega permiso para Video
      token.addGrant(new VideoGrant({ room: room_name }));
      
      // Se verifica si se neceista chat y si se tiene definido el SID
      if (create_conversation && TWILIO_CONVERSATION_SERVICE_SID) {
        const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
          accountSid: TWILIO_ACCOUNT_SID,
        });
        // Se verifica si existe la conversación y si no se crea
        let conversation;
        try {
          conversation = await client.conversations
            .services(TWILIO_CONVERSATION_SERVICE_SID)
            .conversations(room_name)
            .fetch();
        } catch (e) {
          if (e.status === 404) {
            conversation = await client.conversations
              .services(TWILIO_CONVERSATION_SERVICE_SID)
              .conversations
              .create({ friendlyName: room_name });
          } else {
            throw e;
          }
        }
        // Se añade a participante
        await client.conversations
          .services(TWILIO_CONVERSATION_SERVICE_SID)
          .conversations(conversation.sid)
          .participants
          .create({ identity: user_identity });
        // Se añade el permiso para el chat
        token.addGrant(
          new ChatGrant({ serviceSid: TWILIO_CONVERSATION_SERVICE_SID })
        );
      }
      
      return res.json({
        token: token.toJwt(),
        room_type: 'peer-to-peer',
      });
    }
  }
  catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
module.exports = { getToken };