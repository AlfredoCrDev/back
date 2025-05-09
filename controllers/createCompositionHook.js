const client = require('../config/twilioClient');

const createCompositionHook = async (req, res) => {
  try {
    console.log('Entrando a createCompositionHook');
    if (req.method === 'POST') {
      const hook = await client.video.v1.compositionHooks.create({
        friendlyName: 'Kimun Composition Hook5',
        format: 'mp4',
        resolution: '1280x720',
        videoLayout: {
          main: {
            z_pos: 1,
            x_pos: 0,
            y_pos: 0,
            width: 1280,
            height: 600,
            video_sources: ["screen-video-share"],
          },
          row: {
            z_pos: 2,
            x_pos: 0,
            y_pos: 600,
            width: 1260,
            height: 120,
            max_rows: 1,
            video_sources: ["*"],
            video_sources_excluded: ["screen-video-share"],
          }
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
      res.status(500).json({ error: 'Error creando Composition Hook', details: error.message });
    }
  }

  module.exports = {createCompositionHook};