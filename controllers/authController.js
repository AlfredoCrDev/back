const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const TWILIO_CONVERSATION_SERVICE_SID = process.env.TWILIO_CONVERSATION_SERVICE_SID;

const getToken = async (req, res) => {
  try {
    console.log('Entrando a getToken');
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

      const uniqueIdentity = `${user_identity}_${Date.now()}`;
      console.log('Generado user_identity único:', uniqueIdentity);
      
      console.log('Creando nuevo AccessToken para:', uniqueIdentity);
      const token = new AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        { identity: uniqueIdentity }
      );
      
      // Se agrega permiso para Video
      token.addGrant(new VideoGrant({ room: room_name }));
      
      // Se verifica si se neceista chat y si se tiene definido el SID
      if (create_conversation && TWILIO_CONVERSATION_SERVICE_SID) {
        console.log('Procesando conversación para room_name:', room_name);
        const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
          accountSid: TWILIO_ACCOUNT_SID,
        });
        // Se verifica si existe la conversación y si no se crea
        let conversation;
        try {
          console.log('Buscando conversación con uniqueName:', room_name);
          conversation = await client.conversations
            .v1.services(TWILIO_CONVERSATION_SERVICE_SID)
            .conversations(room_name)
            .fetch();
            console.log('Conversación encontrada:', conversation.sid);
        } catch (e) {
          if (e.status === 404) {
            console.log('Conversación no encontrada, creando nueva con uniqueName:', room_name);
            conversation = await client.conversations
              .v1.services(TWILIO_CONVERSATION_SERVICE_SID)
              .conversations
              .create({ friendlyName: room_name, uniqueName: room_name });
              console.log('Conversación creada:', conversation.sid);
          } else {
            throw e;
          }
        }
        // Se añade a participante
        try {
          console.log('Añadiendo participante:', uniqueIdentity, 'a conversación:', conversation.sid);
          await client.conversations
            .v1.services(TWILIO_CONVERSATION_SERVICE_SID)
            .conversations(conversation.sid)
            .participants
            .create({ identity: uniqueIdentity });
            console.log('Participante añadido correctamente');
        } catch (e) {
          if (e.code === 50433) {
            console.log('Participante ya existe en la conversación:', uniqueIdentity);
          } else {
            console.error('Error al añadir participante:', e.message, 'Código:', e.code);
            throw e;
          }
        }
        
        // Se añade el permiso para el chat
        token.addGrant(
          new ChatGrant({ serviceSid: TWILIO_CONVERSATION_SERVICE_SID })
        );
      } else {
        console.log('No se crea conversación:', {
          create_conversation,
          TWILIO_CONVERSATION_SERVICE_SID: !!TWILIO_CONVERSATION_SERVICE_SID,
        });
      }
      
      const jwtToken = token.toJwt();
      console.log('Token JWT generado:', jwtToken.substring(0, 50) + '...');

      const response = {
        token: jwtToken,
        room_type: 'group',
        room_name: room_name,
      };

      console.log('Respuesta enviada:', response);
      return res.json(response);
    }
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
module.exports = { getToken };