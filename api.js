const baseUrl = 'http://10.42.0.1:3000';

// const baseUrl = 'http://192.168.29.231:3000';

export default {
  health: async function () {
    return apicall({
      url: `${baseUrl}/health`,
      method: 'GET',
    });
  },
  downloadData: async function () {
    return apicall({
      url: `${baseUrl}/health`,
      method: 'GET',
    });
  },
  postDocument: async (doc) => {
    const url = `${baseUrl}/upload-alarm`;
    const fileUri = doc.uri;
    const formData = new FormData();
    formData.append('alarm', doc);
    const options = {
      method: 'POST',
      body: formData,
    };
    try {
      let resp = await fetch(url, options);
      if (resp.status != 200 && resp.status != 304) {
        let data = await resp.json();
        alert(data.message || 'something went wrong');
        throw data.message || 'something went wrong.';
      }
      return resp.json();
    } catch (error) {
      throw error;
    }
  },
  getCameraIp: async () => {
    return apicall({
      url: `${baseUrl}/camera-ip`,
      method: 'GET',
    });
  },

  getCameraConfig: async () => {
    return apicall({
      url: `${baseUrl}/env-status`,
      method: 'GET',
    });
  },

  setCameraConfig: async (data) => {
    return apicall({
      url: `${baseUrl}/update-config`,
      method: 'POST',
      data: data,
    });
  },
};

async function apicall({ method = 'POST', url, data = null }, token) {
  try {
    let resp = await fetch(url, {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    if (resp.status != 200 && resp.status != 304) {
      let data = await resp.json();
      alert(data.message || 'something went wrong');
      throw data.message || 'something went wrong.';
    }
    return resp.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
