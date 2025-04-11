const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

const getToken = (req, res) => {
  // Obtener los parámetros idUser e idRequest de la query
  const { idUser, idRequest } = req.query;

  // Validar que ambos parámetros estén presentes
  if (!idUser){
    return res.status(400).json({ error: 'idUser es requerido' });
  }
  if (!idRequest){
    return res.status(400).json({ error: 'idRequest es requerido' });
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

  res.json({
    token: token.toJwt(),
    room,
  });
};

module.exports = { getToken };