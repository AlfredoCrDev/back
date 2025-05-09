const client = require('../config/twilioClient');

const compositionById = async (req, res) => {
  const { sid } = req.params;

  try {
    console.log("Obteniendo composición por ID:", sid);
    const composition = await client.video.v1.compositions(sid).fetch();

    res.json({
      sid: composition.sid,
      roomSid: composition.roomSid,
      status: composition.status,
      dateCompleted: composition.dateCompleted,
      duration: composition.duration,
      format: composition.format,
      mediaLink: composition.links.media,
    });
  } catch (error) {
    console.error('Error al obtener la composición:', error.message);
    res.status(500).json({ error: 'Error obteniendo la composición' });
  }
};

module.exports = { compositionById };
