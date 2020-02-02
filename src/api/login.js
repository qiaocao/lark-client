import { axios } from '@/utils/request'

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return axios({
    url: '/auth/jwt/token',
    method: 'post',
    data: parameter
  })
}

export function getInfo () {
  return axios({
    // url: '/user/info',
    url: '/admin/user/front/info',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function logout () {
  return axios({
    url: '/auth/jwt/logout',
    method: 'get'
  })
}
