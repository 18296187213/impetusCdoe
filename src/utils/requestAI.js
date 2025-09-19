import axios from 'axios';
import { Message } from 'element-ui';

// 公司AI接口配置
const AI_ENDPOINTS = {
    qwen3: 'http://192.168.130.200:8103/v1',
    qwen2_5_coder: 'http://192.168.130.200:8102/v1',
};

const API_KEY = 'ak-test-123';

// 创建AI接口专用的axios实例
const createAIService = (baseURL) => {
    return axios.create({
        baseURL,
        timeout: 60000, // AI接口超时时间设置更长
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: `Bearer ${API_KEY}`,
            'X-API-Key': API_KEY,
        },
    });
};

// AI服务实例
export const qwen3Service = createAIService(AI_ENDPOINTS.qwen3);
export const qwen2CoderService = createAIService(AI_ENDPOINTS.qwen2_5_coder);

// AI服务响应拦截器
const setupAIInterceptors = (service) => {
    service.interceptors.response.use(
        (response) => {
            return response.data;
        },
        (error) => {
            console.error('AI接口错误:', error);
            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 401:
                        Message.error('API Key无效或已过期');
                        break;
                    case 429:
                        Message.error('请求频率过高，请稍后重试');
                        break;
                    case 500:
                        Message.error('AI服务暂时不可用');
                        break;
                    default:
                        Message.error(data && data.message || 'AI接口调用失败');
                }
            } else {
                Message.error('网络错误，请检查连接');
            }
            return Promise.reject(error);
        },
    );
};

// 为AI服务设置拦截器
setupAIInterceptors(qwen3Service);
setupAIInterceptors(qwen2CoderService);
