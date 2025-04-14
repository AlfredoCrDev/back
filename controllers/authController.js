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

      // Crear Video Token
      const videoToken = new AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        { identity: user_identity }
      );
      const videoGrant = new VideoGrant({
        room: room_name,
      });
      videoToken.addGrant(videoGrant);

      const response = {
        token: videoToken.toJwt(),
        room_type: 'peer-to-peer',
      };

      // Manejar Conversations si create_conversation es true
      if (create_conversation) {
        console.log("Holaaaa");
        if (!TWILIO_CONVERSATION_SERVICE_SID) {
          console.error('Falta TWILIO_CONVERSATION_SERVICE_SID');
          return res.status(500).json({
            error: 'Configuración de Conversations no disponible',
          });
        }

        const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
          accountSid: TWILIO_ACCOUNT_SID,
        });

        // Crear o buscar conversación
        let conversation;
        try {
          conversation = await client.conversations
            .services(TWILIO_CONVERSATION_SERVICE_SID)
            .conversations(room_name)
            .fetch();
        } catch (e) {
          if (e.status === 404) {
            // Crear nueva conversación si no existe
            conversation = await client.conversations
              .services(TWILIO_CONVERSATION_SERVICE_SID)
              .conversations
              .create({ friendlyName: room_name });
          } else {
            throw e;
          }
        }

        // Añadir participante
        await client.conversations
          .services(TWILIO_CONVERSATION_SERVICE_SID)
          .conversations(conversation.sid)
          .participants
          .create({ identity: user_identity });

        // Crear Conversation Token
        const chatToken = new AccessToken(
          TWILIO_ACCOUNT_SID,
          TWILIO_API_KEY_SID,
          TWILIO_API_KEY_SECRET,
          { identity: user_identity }
        );
        const chatGrant = new ChatGrant({
          serviceSid: TWILIO_CONVERSATION_SERVICE_SID,
        });
        chatToken.addGrant(chatGrant);

        response.conversation_token = chatToken.toJwt();
      }

      return res.json(response);
    } else if (req.method === 'GET') {
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

      return res.json({
        token: token.toJwt(),
        room,
      });
    } else {
      return res.status(405).json({
        error: 'Método no permitido',
      });
    }
  } catch (error) {
    console.error('Error en getToken:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = { getToken };