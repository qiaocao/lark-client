const api = {
  AppName: 'lark',
  HttpProtocol: 'http',
  HttpPort: 7300,
  WsPort: 9326,
  Init: '/api/user/init',
  HisUrl: '/api/message/list',
  // 获取当前研讨组的用户列表
  ChatUsersUrl: '/api/user/chatUserList',
  TokenPath: '/oauth/token',
  RegisterUrl: '/register',
  WsProtocol: 'ws',
  Login: '/auth/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  // 获取用户信息
  UserInfo: '/user/info',
  getHostUrl: function () {
    // return this.HttpProtocol + '://' + localStorage.getItem('host') + ':' + this.HttpPort
    return this.HttpProtocol + '://localhost:' + this.HttpPort
  },
  getTokenUrl: function () {
    return this.getHostUrl() + this.TokenPath
  },
  getInitUrl: function () {
    return this.getHostUrl() + this.Init
  },
  getChatUsersUrl: function () {
    return this.getHostUrl() + this.ChatUsersUrl
  },
  getHisUrl: function () {
    return this.getHostUrl() + this.HisUrl
  },
  getRegisterUrl: function () {
    return this.getHostUrl() + this.RegisterUrl
  },
  getWsUrl: function () {
    return this.WsProtocol + '://localhost:' + this.WsPort
  }
}
export default api
