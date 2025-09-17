import request from '@/utils/request'

// 查询任务管理列表
export function listTask(query) {
  return request({
    url: '/api/work/list',
    method: 'get',
    params: query
  })
}

// 获取任务管理详细信息
export function getTaskInfo(id) {
  return request({
    url: '/api/work/getInfo?workId=' + id,
    method: 'get'
  })
}

// 新增任务管理
export function addTask(data) {
  return request({
    url: '/api/work/add',
    method: 'post',
    data: data
  })
}

// 修改任务管理
export function updateTask(data) {
  return request({
    url: '/api/work/update',
    method: 'post',
    data: data
  })
}

// 删除任务管理
export function delTask(id) {
  return request({
    url: '/api/work/remove?id=' + id,
    method: 'get'
  })
}

// 查询用户任务管理列表
export function listUserTask(query) {
  return request({
    url: '/api/userWork/list',
    method: 'get',
    params: query
  })
}

// 根据任务id查询用例列表
export function listTestByTaskId(query) {
  return request({
    url: '/api/userWork/testList',
    method: 'get',
    params: query
  })
}

// 更新任务
export function updateUserTask(data) {
  return request({
    url: '/api/userWork/updateWorkTest',
    method: 'post',
    data: data
  })
}

// 任务提交
export function submitTask(query) {
  return request({
    url: '/api/userWork/submitWork',
    method: 'get',
    params: query
  })
}
