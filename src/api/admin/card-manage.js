/**
 * @file 首页卡片管理相关的接口
 * @author jihainan
 */

import { axios } from '@/utils/request'

const api = {
  /** 首页卡片管理接口地址 */
  cardManage: 'admin/card',
  /** 首页卡片分页查询接口地址 */
  getCard: 'admin/card/page'
}

/**
 * @description 添加首页卡片
 * @method addPortalCard
 * @param {Object} data 卡片信息
 * @returns {Promise} 包含响应数据的Promise对象
 */
const addPortalCard = (data) => {
  return axios({
    url: api.cardManage,
    method: 'POST',
    data
  })
}

/**
 * @description 查询首页卡片
 * @method getPortalCard
 * @param {Object} params 查询信息
 * @returns {Promise} 包含响应数据的Promise对象
 */
const getPortalCard = (params) => {
  return axios({
    url: api.getCard,
    method: 'GET',
    params
  })
}

/**
 * @description 更新首页卡片
 * @method updatePortalCard
 * @param {Object} data 卡片信息
 * @returns {Promise} 包含响应数据的Promise对象
 */
const updatePortalCard = (data) => {
  return axios({
    url: api.cardManage,
    method: 'PUT',
    data
  })
}

/**
 * @description 删除首页卡片
 * @method deletePortalCard
 * @param {String} id 卡片ID
 * @returns {Promise} 包含响应数据的Promise对象
 */
const deletePortalCard = (id) => {
  return axios({
    url: api.cardManage + '/' + id,
    method: 'DELETE'
  })
}

export {
  addPortalCard,
  getPortalCard,
  updatePortalCard,
  deletePortalCard
}
