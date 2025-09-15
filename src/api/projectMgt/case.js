import request from '@/utils/request'

// 查询用例管理列表
export function listCase(query) {
  return request({
    url: '/api/test/list',
    method: 'get',
    params: query
  })
}

// 获取用例管理详细信息
export function getCaseInfo(id) {
  return request({
    url: '/api/test/getById?id=' + id,
    method: 'get'
  })
}

// 新增用例管理
export function addCase(data) {
  return request({
    url: '/api/test/add',
    method: 'post',
    data: data
  })
}

// 修改用例管理
export function updateCase(data) {
  return request({
    url: '/api/test/update',
    method: 'post',
    data: data
  })
}

// 删除用例管理
export function delCase(id) {
  return request({
    url: '/api/test/remove?id=' + id,
    method: 'get'
  })
}
