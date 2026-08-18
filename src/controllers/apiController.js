export const getHealthStatus = (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebRTC Signaling Server Running!'
  });
};

export const getTurnCredentials = async (req, res) => {
  try {
    const apiKey = process.env.METERED_API_KEY;
    const domain = process.env.METERED_DOMAIN;
    if (!apiKey || !domain) {
      return res.status(500).json({ error: 'TURN server credentials not configured' });
    }
    
    const response = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Metered API responded with status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching TURN credentials:', error);
    res.status(500).json({ error: 'Failed to fetch TURN credentials' });
  }
};
