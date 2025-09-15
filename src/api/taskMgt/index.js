import request from '@/utils/request'

// 查询项目管理列表
export function listTask(query) {
  return request({
    url: '/api/work/list',
    method: 'get',
    params: query
  })
}

// 获取项目管理详细信息
export function getTaskInfo(id) {
  return request({
    url: '/api/work/getInfo?workId=' + id,
    method: 'get'
  })
}

// 新增项目管理
export function addTask(data) {
  return request({
    url: '/api/work/add',
    method: 'post',
    data: data
  })
}

// 修改项目管理
export function updateTask(data) {
  return request({
    url: '/api/work/update',
    method: 'post',
    data: data
  })
}

// 删除项目管理
export function delTask(id) {
  return request({
    url: '/api/work/remove?id=' + id,
    method: 'get'
  })
}
