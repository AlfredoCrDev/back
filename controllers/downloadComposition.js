const client = require('../config/twilioClient');

const downloadComposition = async (req, res) => {
  const { sid } = req.params;

  try {
    console.log("Obteniendo composición para descargar:", sid);
    
    const composition = await client.video.v1.compositions(sid).fetch();

    const response = await client.request({
      method: 'GET',
      uri: composition.links.media,
    });
    const downloadUrl = response.headers.location;

    res.json({ downloadUrl });
    // res.redirect(downloadUrl);
  } catch (error) {
    console.error('Error al obtener la URL de descarga:', error.message);
    res.status(500).json({ error: 'Error generando la URL de descarga' });
  }
};

module.exports = { downloadComposition };