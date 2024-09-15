import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function GET(url) {
  try {
    console.log('Making GET request to:', `${baseUrl}${url}`);
    const res = await axios.get(`${baseUrl}${url}`);
    return res;
  } catch (error) {
    console.error('API GET request failed:', error);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    return error.response;
  }
}

export async function POST(url, data) {
  try {
    console.log('Making POST request to:', `${baseUrl}${url}`);
    const res = await axios.post(`${baseUrl}${url}`, data);
    return res;
  } catch (error) {
    console.error('API POST request failed:', error);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    return error.response;
  }
}

export async function PUT(url, data) {
  try {
    console.log('Making PUT request to:', `${baseUrl}${url}`);
    const res = await axios.put(`${baseUrl}${url}`, data);
    return res;
  } catch (error) {
    console.error('API PUT request failed:', error);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    return error.response;
  }
}

export async function DELETE(url) {
  try {
    console.log('Making DELETE request to:', `${baseUrl}${url}`);
    const res = await axios.delete(`${baseUrl}${url}`);
    return res;
  } catch (error) {
    console.error('API DELETE request failed:', error);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    return error.response;
  }
}
