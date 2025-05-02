const compositionCallBack = (req, res) => {
  console.log('Callback recibido:', req.body);
  const { CompositionSid, Status, RoomSid } = req.body;
  if (Status === 'completed') {
    console.log(`Composition ${CompositionSid} completada para sala ${RoomSid}`);
  }
  res.status(200).send();
};

module.exports = { compositionCallBack };