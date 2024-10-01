import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

export const verifyCode = async ({ code }: { code: string }) => {
  return axiosInstance.post('/api/verifyCode', { params: { code } });
};

export const getIsEmailUsed = async ({ email }: { email: string }) => {
  return axiosInstance.get('/api/isEmailUsed', { params: { email } });
};

export const getIsWalletUsed = async ({ wallet }: { wallet: string }) => {
  return axiosInstance.get('/api/isWalletUsed', { params: { wallet } });
};

export const reserve = async ({
  code,
  email,
  wallet,
  signature,
}: {
  code: string;
  email: string;
  wallet: string;
  signature: string;
}) => {
  return axiosInstance.post('/api/reserve', { code, email, wallet, signature });
};
