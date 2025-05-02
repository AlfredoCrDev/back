const twilio = require('twilio');

const createCompositionHook = async (req, res) => {
  try {
    console.log('Entrando a createCompositionHook');
    if (req.method === 'POST') {
      const client = twilio(
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        { accountSid: process.env.TWILIO_ACCOUNT_SID }
      );
      const hook = await client.video.compositionHooks.create({
        friendlyName: 'Kimun Composition Hook',
        format: 'mp4',
        videoLayout: {
          grid: {
            video_sources: ['*'],
          },
        },
        audioSources: ['*'],
        trim: true,
        statusCallback: 'https://back-kimun-twilio.onrender.com/composition-callback',
        statusCallbackMethod: 'POST',
      });
      console.log('Composición creada:', hook.sid);
      res.json({ hookSid: hook.sid });
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
      console.error('Error al crear el hook de composición:', error.message, 'Código:', error.code);
      res.status(500).json({ error: 'Error creando Composition Hook' });
    }
  }

  module.exports = {createCompositionHook};