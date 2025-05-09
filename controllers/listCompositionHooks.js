const client = require('../config/twilioClient');

const listCompositionHooks = async (req, res) => {
  try {
    const hooks = await client.video.v1.compositionHooks.list();

    const formattedHooks = hooks.map(hook => ({
      sid: hook.sid,
      friendlyName: hook.friendlyName,
      enabled: hook.enabled,
      dateCreated: hook.dateCreated,
      videoLayout: hook.videoLayout,
      resolution: hook.resolution,
      statusCallback: hook.statusCallback,
    }));

    res.json(formattedHooks);
  } catch (error) {
    console.error('Error al listar los Composition Hooks:', error.message);
    res.status(500).json({ error: 'Error al obtener los Composition Hooks', details: error.message });
  }
};

module.exports = { listCompositionHooks };
