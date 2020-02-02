import { axios } from '@/utils/request'

const api = {
  user: '/user',
  role: '/admin/role',
  service: '/service',
  permission: '/admin/role/permission',
  permissionNoPager: '/permission/no-pager',
  // orgTree: '/org/tree'
  orgTree: '/admin/orgtree'
}

export default api

export function getUserList (parameter) {
  return axios({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return axios({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function postRole (data) {
  return axios({
    url: api.role,
    method: 'post',
    data: data
  })
}

export function putRole (data) {
  return axios({
    url: api.role,
    method: 'put',
    data: data
  })
}

export function getServiceList (parameter) {
  return axios({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return axios({
    url: api.permission,
    method: 'get',
    params: parameter
  })
}

export function putPermissions (data) {
  return axios({
    url: api.permission,
    method: 'put',
    data: data
  })
}

export function getOrgTree (parameter) {
  return axios({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return axios({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}
