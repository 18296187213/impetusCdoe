import request from '@/utils/request'

// 提问-用例测试
export function aiStream(query) {
  return request({
    url: '/api/ai/stream',
    method: 'get',
    params: query
  })
}
