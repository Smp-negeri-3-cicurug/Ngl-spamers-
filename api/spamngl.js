export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const nglUrl = searchParams.get('url');
    const message = searchParams.get('message');

    // Validation
    if (!nglUrl || !message) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'URL dan message harus diisi!',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Extract username from NGL URL
    let username = '';
    if (nglUrl.includes('ngl.link/')) {
      username = nglUrl.split('ngl.link/')[1].split('?')[0].split('/')[0];
    } else {
      username = nglUrl;
    }

    if (!username) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'URL NGL tidak valid!',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Send message to NGL
    const nglApiUrl = 'https://ngl.link/api/submit';
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('question', message);
    formData.append('deviceId', generateDeviceId());
    formData.append('gameSlug', '');
    formData.append('referrer', '');

    const response = await fetch(nglApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://ngl.link',
        'Referer': `https://ngl.link/${username}`,
      },
      body: formData.toString(),
    });

    const data = await response.text();

    if (response.ok) {
      return new Response(
        JSON.stringify({
          status: 'success',
          message: 'Pesan berhasil dikirim!',
          username: username,
          data: data,
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Gagal mengirim pesan ke NGL',
          details: data,
        }),
        {
          status: response.status,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Terjadi kesalahan server',
        error: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Generate random device ID
function generateDeviceId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let deviceId = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      deviceId += '-';
    } else {
      deviceId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return deviceId;
                                     }
