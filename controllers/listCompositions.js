const client = require('../config/twilioClient');

const listCompositions = async (req, res) => {
  try {
    console.log("Listando composiciones...");
    const compositions = await client.video.v1.compositions.list({ 
      limit: 20 
    });
    const formattedCompositions = compositions.map(composition => ({
      sid: composition.sid,
      roomSid: composition.roomSid,
      status: composition.status,
      dateCompleted: composition.dateCompleted,
      format: composition.format,
      duration: composition.duration,
      size: composition.size,
      resolution: composition.resolution,
      mediaLink: composition.links.media,
    }));
    console.log('Composiciones obtenidas:', formattedCompositions);
    res.status(200).json(formattedCompositions);
  } catch (error) {
    console.error('Error al listar las composiciones:', error.message, 'Código:', error.code);
    res.status(500).json({ error: 'Error obteniendo la lista de composiciones' });
  }
}

module.exports = { listCompositions };