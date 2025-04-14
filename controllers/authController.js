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

      const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
        accountSid: TWILIO_ACCOUNT_SID,
      });

      // Crear la sala de video
      const room = await client.video.rooms.create({
        uniqueName: room_name,
        type: 'peer-to-peer', // se puede usar 'group' si usas grabaciones
        recordParticipantsOnConnect: false,
      });

      // Si se solicita la conversación y hay SID de servicio de chat
      if (create_conversation && TWILIO_CONVERSATION_SERVICE_SID) {
        let conversation;
        try {
          // Intentar buscar una conversación usando el room.sid como uniqueName
          conversation = await client.conversations
            .services(TWILIO_CONVERSATION_SERVICE_SID)
            .conversations(room.sid)
            .fetch();
        } catch (e) {
          if (e.status === 404) {
            // No existe: crear una nueva conversación con el room.sid como uniqueName
            conversation = await client.conversations
              .services(TWILIO_CONVERSATION_SERVICE_SID)
              .conversations
              .create({
                uniqueName: room.sid,
                friendlyName: room_name,
              });
          } else {
            throw e;
          }
        }

        // Agregar al usuario a la conversación
        await client.conversations
          .services(TWILIO_CONVERSATION_SERVICE_SID)
          .conversations(conversation.sid)
          .participants
          .create({ identity: user_identity });

        // Agregar permisos para Chat
        token.addGrant(
          new ChatGrant({ serviceSid: TWILIO_CONVERSATION_SERVICE_SID })
        );
      }

      return res.json({
        token: token.toJwt(),
        room_type: 'peer-to-peer',
      });
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getToken };