import request from '@/utils/request'

// 查询模块管理列表
export function listModule(query) {
  return request({
    url: '/api/modules/list',
    method: 'get',
    params: query
  })
}

// 获取模块管理详细信息
export function getModuleInfo(id) {
  return request({
    url: '/api/modules/getByProId?id=' + id,
    method: 'get'
  })
}

// 新增模块管理
export function addModule(data) {
  return request({
    url: '/api/modules/add',
    method: 'post',
    data: data
  })
}

// 修改模块管理
export function updateModule(data) {
  return request({
    url: '/api/modules/update',
    method: 'post',
    data: data
  })
}

// 删除模块管理
export function delModule(id) {
  return request({
    url: '/api/modules/remove?id=' + id,
    method: 'get'
  })
}
