import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

export const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터 //로컬스토리지에서 토큰 가져오고 헤더에추가하는 로직 추가함
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');

    // 토큰이 있으면 요청 헤더에 추가
    if (token && !config.url?.includes('/api/v2/manager/auth/')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (token: string | null, error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

const removeAccessToken = () => {
  localStorage.removeItem('accessToken');
};

// 응답 인터셉터
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      originalRequest.url?.includes('/api/v2/manager/auth/') &&
      error.response?.status === 401
    ) {
      removeAccessToken();
      window.location.href = '/login';
      return Promise.reject(
        new Error('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.')
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      } else {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await instance.get('/api/v2/manager/auth/');

          console.log(res);

          const newAccessToken = res.data?.data?.access_token;
          if (!newAccessToken) throw new Error('토큰이 응답에 없습니다.');

          // 토큰 저장 및 큐 처리
          setAccessToken(newAccessToken);
          processQueue(newAccessToken, null);

          // 요청 재시도
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          processQueue(null, err as AxiosError);
          removeAccessToken();

          // window.location.href = '/login';

          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

//이미지처리로직 수정
export const instatnceWithImg: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 10000,
});

// 요청 인터셉터 - 토큰을 헤더에 추가
instatnceWithImg.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');

    // 토큰이 있으면 요청 헤더에 추가 (리프레시 요청 제외)
    if (token && !config.url?.includes('/api/v2/manager/auth/')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신 로직 포함
instatnceWithImg.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // 리프레시 토큰 요청 자체가 실패한 경우
    if (
      originalRequest.url?.includes('/api/v2/manager/auth/') &&
      error.response?.status === 401
    ) {
      removeAccessToken();
      window.location.href = '/login';
      return Promise.reject(
        new Error('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.')
      );
    }

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 갱신 중인 경우 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(instatnceWithImg(originalRequest));
            },
            reject,
          });
        });
      } else {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 토큰 갱신 요청 (일반 instance 사용)
          const res = await instance.get('/api/v2/manager/auth/');

          const newAccessToken = res.data?.data?.access_token;
          if (!newAccessToken) throw new Error('토큰이 응답에 없습니다.');

          // 토큰 저장 및 큐 처리
          setAccessToken(newAccessToken);
          processQueue(newAccessToken, null);

          // 원본 요청 재시도
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instatnceWithImg(originalRequest);
        } catch (err) {
          processQueue(null, err as AxiosError);
          removeAccessToken();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // 연결 타임아웃 에러 처리
    if (error.code === 'ECONNABORTED') {
      window.location.href = '/error';
    }

    return Promise.reject(error);
  }
);
