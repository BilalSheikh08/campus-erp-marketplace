import client from './client';

export const submitContactInquiry = async (data) => {
  const response = await client.post('/api/support/inquiries/', data);
  return response.data;
};
