import request from '@/utils/request'

// 查询项目管理列表
export function listProject(query) {
  return request({
    url: '/api/projects/list',
    method: 'get',
    params: query
  })
}

// 获取项目管理详细信息
export function getProjectInfo(id) {
  return request({
    url: '/api/projects/getInfo?projectsId=' + id,
    method: 'get'
  })
}

// 新增项目管理
export function addProject(data) {
  return request({
    url: '/api/projects/add',
    method: 'post',
    data: data
  })
}

// 修改项目管理
export function updateProject(data) {
  return request({
    url: '/api/projects/update',
    method: 'post',
    data: data
  })
}

// 删除项目管理
export function delProject(id) {
  return request({
    url: '/api/projects/remove?id=' + id,
    method: 'get'
  })
}
