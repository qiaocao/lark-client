// 这个组件必须最先引入，否则会报错
import MessagePiece from './MessagePiece'
import Face from './tools/Face'
// 抽屉组件
import TalkDrawer from './drawers/TalkDrawer'

import ConvBox from './ConvBox'
import RecentContactsItem from './RecentContactsItem'
import ContactsTree from './ContactsTree'
import ContactsInfo from './ContactsInfo'
import ContactItem from './ContactItem'
import GroupItem from './GroupItem'
import GroupInfo from './GroupInfo'

import CreateTalk from './createTalk/CreateTalk'

import SearchAll from './tools/SearchAll'

export {
  // 消息展示组件
  MessagePiece,
  // 研讨对话框组件
  ConvBox,
  // 联系人组件
  ContactsTree,
  // 联系人信息组件
  ContactsInfo,
  // 最近联系人(项)组件
  RecentContactsItem,
  // 群组(项)组件
  GroupItem,
  ContactItem,
  // 群组信息组件
  GroupInfo,
  // 创建新的研讨
  CreateTalk,
  // 联系人搜索组件
  SearchAll,
  // 表情插件
  Face,
  // 研讨抽屉组件
  TalkDrawer

}
