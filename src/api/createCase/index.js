import request from '@/utils/request'

// 提问-Ai用例生成
export function aiCase(data) {
  return request({
    url: '/api/ai/aiCase',
    method: 'post',
    data: data
  })
}

// 保存用例
export function saveCase(data) {
  return request({
    url: '/api/test/addBath',
    method: 'post',
    data: data
  })
}
