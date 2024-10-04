import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

export const verifyCode = async ({ code }: { code: string }) => {
  // mock first
  if (code === '123456') {
    return {
      isSuccess: true,
    };
  }

  return {
    error: 'Code is invalid',
  };

  // return axiosInstance.get(`/api/verifyCode?code=${code}`);
};

export const getIsEmailUsed = async ({ email }: { email: string }) => {
  // mock first
  if (email === 'test@test.com') {
    return {
      isSuccess: true,
    };
  }

  return {
    error: 'Email is not used',
  };

  // return axiosInstance.get('/api/isEmailUsed', { params: { email } });
};

export const getIsWalletUsed = async ({ wallet }: { wallet: string }) => {
  return {
    isSuccess: true,
  };
  // random
  // return Math.random() > 0.5
  //   ? {
  //       isSuccess: true,
  //     }
  //   : {
  //       error: 'Wallet is used',
  //     };

  // return axiosInstance.get('/api/isWalletUsed', { params: { wallet } });
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
  // mock first
  return {
    isSuccess: true,
  };

  // return axiosInstance.post('/api/reserve', { code, email, wallet, signature });
};
