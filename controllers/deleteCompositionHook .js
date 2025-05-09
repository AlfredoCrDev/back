const client = require('../config/twilioClient');

const deleteCompositionHook = async (req, res) => {
  const { hookSid } = req.params;

  if (!hookSid) {
    return res.status(400).json({ error: 'Falta el parámetro hookSid' });
  }

  try {
    await client.video.v1.compositionHooks(hookSid).remove();
    res.json({ message: `Composition Hook ${hookSid} eliminado correctamente.` });
  } catch (error) {
    console.error(`Error al eliminar Composition Hook ${hookSid}:`, error.message);
    res.status(500).json({
      error: `No se pudo eliminar el Composition Hook ${hookSid}`,
      details: error.message,
    });
  }
};

module.exports = { deleteCompositionHook };