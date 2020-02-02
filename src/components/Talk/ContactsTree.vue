<template>
  <a-tree
    class="contacts-tree"
    :treeData="contactsTree"
    :loadData="handleLoadChildren"
    @select="handleSelect"
    :defaultExpandAll="false"
  >
    <!-- 组织节点 -->
    <template slot="orgNode" slot-scope="{title}">
      <a-icon type="folder" class="org-node-icon"></a-icon>
      <span class="org-node-title">{{ title }}</span>
    </template>

    <!-- 用户节点 -->
    <template slot="userNode" slot-scope="{title, icon, key}">

      <a-avatar
        :class="['user-node-avatar', getOnlineStatus(key) ? 'on-line-tag' : '']"
        shape="square"
        :src="fileServerIp + icon"
        :size="24"
      >
        {{ title.slice(0, 1) }}
      </a-avatar>

      <span class="user-node-title">{{ title }}</span>
      <!-- <span>{{ this.$store.state.onlineList }}</span> -->
    </template>

  </a-tree>
</template>

<script>
import { mapGetters } from 'vuex'
import { getContactsTree } from '@/api/talk'
import { FILE_SERVER_IP } from '@/utils/constants'
// import store from '@/store'
export default {
  name: 'ContactsTree',
  props: {
    /**
     * 联系人结构树
        {
          title: '十一室',
          icon: 'folder',
          key: '0-1-1',
          scopedSlots: {
            title: 'orgNode'
          },
          children: [
            {
              title: '三块五',
              icon: '/avatar2.jpg',
              key: '0-1-1-1',
              online: true,
              scopedSlots: {
                title: 'userNode'
              }
            }
          ]
        }
     */
    contactsTree: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters(['getOnlineStatus'])
  },
  data () {
    return {
      fileServerIp: FILE_SERVER_IP
    }
  },
  methods: {
    handleSelect (selectedKeys, { selectedNodes }) {
      if (selectedNodes.length) {
        // TODO:层级太多了
        if (selectedNodes[0].data.props.dataRef.scopedSlots.title === 'userNode') {
          this.$emit('SelectContacts', selectedKeys[0])
        }
      }
    },
    /**
     * 加载组织下的子节点
     */
    handleLoadChildren ({ dataRef }) {
      // 判断节点类型
      const nodeTitle = (dataRef.scopedSlots || {}).title
      if (nodeTitle === 'orgNode') {
        // 发起数据请求，更新树结构
        return getContactsTree(dataRef.key).then(res => {
          if (res.status === 200) {
            const formatList = this.formatList(res.result.data)
            dataRef.children = formatList
          }
        })
      } else {
        return new Promise(resolve => {
          resolve()
        })
      }
    },
    /**
     * 格式化数据
     */
    formatList (todoList) {
      if (!todoList) {
        return []
      }
      const self = this
      const target = todoList.map(function (element) {
        let newItem = {}
        if (element.scopedSlotsTitle === 'orgNode') {
          // 处理组织节点
          newItem = {
            key: element.id,
            title: element.orgName,
            parentId: '',
            icon: 'folder',
            online: false,
            selectable: false,
            scopedSlots: {
              title: 'orgNode'
            },
            children: self.formatList(element.children)
          }
        } else if (element.scopedSlotsTitle === 'userNode') {
          // 处理用户节点
          newItem = {
            key: element.id,
            title: element.name,
            parentId: '',
            icon: element.avatar,
            // TODO:去掉在线标识
            // online: element.online,
            online: true,
            isLeaf: true,
            scopedSlots: {
              title: 'userNode'
            }
          }
        }
        return newItem
      })
      return target
    }
  }
}

</script>

<style lang="less" scoped>
  .contacts-tree {
    .org-node-icon {
      font-size: 16px;
      margin-right: 3px;
    }
    .org-node-title {
      font-size: 16px;
    }

    .user-node-avatar {
      border-radius: 2px;
      margin:0 5px 4px 0px;
      background-color: #4da6fa;
      span {
        color: #fff;
      }
    }
    .user-node-title {
      color: black;
      font-size: 14px;
      line-height: 24px;
    }
  }
</style>
