export const getHealthStatus = (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebRTC Signaling Server Running!'
  });
};
