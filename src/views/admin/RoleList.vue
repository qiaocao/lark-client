<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="8" type="flex" justify="end">
          <a-col :md="6" :sm="24">
            <a-form-item label="角色名称">
              <a-input placeholder="请输入" v-model="queryParam.name" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.status">
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="2">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchRole">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a-button
                type="primary"
                style="margin-left: 30px"
                @click="handleAdd()"
                v-action:add
              >新增角色</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <s-table ref="stable" size="default" :columns="columns" :data="loadData">
      <!--TODO 目前只提供了按角色查询权限的接口，这部分提供方法后再做
      <div
        slot="expandedRowRender"
        slot-scope="record"
        style="margin: 0">
        <a-row
          :gutter="24"
          :style="{ marginBottom: '12px' }">
          <a-col :span="12" v-for="(role, index) in record.permissions" :key="index" :style="{ marginBottom: '12px' }">
            <a-col :lg="4" :md="24">
              <span>{{ role.title }}：</span>
            </a-col>
            <a-col :lg="20" :md="24" v-if="role.actionEntitySet.length > 0">
              <a-tag color="cyan" v-for="(action, k) in role.actionEntitySet" :key="k">{{ action.description }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>-</a-col>
          </a-col>
        </a-row>
      </div>
      -->
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)" v-action:update>编辑</a>
        <a-divider type="vertical" />
        <a @click="handlePermission(record)" v-action:update>权限</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多
            <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <!-- <a @click="rolesdisabled(record)">禁用</a> -->
              <a @click="appointUsers(record)" v-action:update>指定用户</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="rolesDetail(record)">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="rolesDelete(record)" v-action:delete>删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </s-table>
    <a-modal
      title="操作"
      style="top: 100px;"
      :width="800"
      v-model="editVisible"
      @ok="handleEditOk"
      :confirmLoading="confirmLoading"
    >
      <a-form :form="editForm">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色标识">
          <a-input :disabled="inDetail||inEdit" v-decorator="['code']" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色名称" hasFeedback>
          <a-input
            placeholder="起一个名字"
            v-decorator="['name',{rules: [{ required: true, message: '请填写角色名称' }]}]"
            :disabled="inDetail"
          />
        </a-form-item>
        <!--
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态"
          hasFeedback
          validateStatus="warning"
        >
          <a-select v-model="mdl.status">
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="2">禁用</a-select-option>
          </a-select>
        </a-form-item>
        -->
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="描述" hasFeedback>
          <a-textarea :rows="5" v-decorator="['description']" :disabled="inDetail" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="创建人"
          hasFeedback
          v-if="inDetail"
        >
          <a-input v-decorator="['creatorId']" :disabled="inDetail" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="创建时间"
          hasFeedback
          v-if="inDetail"
        >
          <a-input v-decorator="['createTime']" :disabled="inDetail" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      title="操作"
      :width="800"
      v-model="perVisible"
      @ok="handlePerOk"
      :confirmLoading="confirmLoading"
    >
      <a-card :bordered="false">
        <a-form>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="基础权限" hasFeedback>
            <a-row :gutter="16" v-for="(permission, index) in basePermissions" :key="index">
              <a-col :span="6">{{ permission.title }}：</a-col>
              <a-col :span="18">
                <a-checkbox-group
                  :options="permission.actionEntitySetList"
                  v-model="baseSelected[index]"
                  :value="baseSelected[index]"
                  @change="basecheckChange"
                />
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-card>
      <a-card :bordered="false">
        <a-form>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="系统权限" hasFeedback>
            <a-row :gutter="16" v-for="(permission, index) in sysPermissions" :key="index">
              <a-col :span="6">{{ permission.title }}：</a-col>
              <a-col :span="18">
                <a-checkbox-group
                  :options="permission.actionEntitySetList"
                  v-model="sysSelected[index]"
                  @change="syscheckChange"
                />
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-card>
      <a-card :bordered="false">
        <a-form>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="业务权限" hasFeedback>
            <a-row :gutter="16" v-for="(permission, index) in bizPermissions" :key="index">
              <a-col :span="6">{{ permission.title }}：</a-col>
              <a-col :span="18">
                <a-checkbox-group
                  :options="permission.actionEntitySetList"
                  v-model="bizSelected[index]"
                  @change="bizcheckChange"
                />
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-card>
    </a-modal>
    <user-model
      ref="model"
      @ok="handleSaveOk"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import UserModel from '@/components/admin/UserTransferModel'
import {
  getRoleList,
  getRolePermission,
  delRole,
  disabledRole,
  updateRole,
  addRole,
  updateRolePermission,
  getRoleUser,
  saveRoleUser
} from '@/api/admin'
export default {
  name: 'Rolelist',
  components: {
    STable,
    UserModel
  },
  data () {
    return {
      // 编辑弹出框
      editVisible: false,
      // 权限弹出框
      perVisible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      editForm: this.$form.createForm(this),
      // 角色行信息
      mdl: {},
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '角色标识',
          dataIndex: 'code'
        },
        {
          title: '角色名称',
          dataIndex: 'name'
        },
        {
          title: '角色描述',
          dataIndex: 'description'
        },
        // {
        //   title: '状态',
        //   dataIndex: 'status'
        // },
        {
          title: '操作',
          width: '200px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getRoleList(parameter).then(res => {
          return res.result
        })
      },
      // 角色权限map <key 角色id value 角色权限 json数组>
      rolePerMap: new Map(),
      rolePermissions: [],
      inDetail: false,
      inAdd: false,
      inEdit: false,
      // 角色id
      roleid: '',
      confirmLoading: false,
      // 分别用来记录权限的全部信息
      basePermissions: [],
      sysPermissions: [],
      bizPermissions: [],
      // 分别用来记录选择的CheckBox
      baseSelected: [],
      sysSelected: [],
      bizSelected: []
    }
  },
  methods: {
    /**
     * CheckBox选择事件
     * 多选框绑定值修改时对应调整this.mdl内容
     * 用于向后台传递数据
     * 这里用中间值tempSelected绑定多选框，是为了解决无法多选框无法点击的问题
     */
    basecheckChange () {
      for (var i in this.baseSelected) {
        this.basePermissions[i].selected = this.baseSelected[i]
        // 遍历权限list 修改defaultChecked值
        const setlist = this.basePermissions[i].actionEntitySetList
        setlist.forEach(item => {
          item.defaultCheck = this.baseSelected[i].some(selected => {
            return selected === item.id
          })
        })
      }
    },
    /**
     * CheckBox选择事件
     */
    syscheckChange () {
      for (var i in this.sysSelected) {
        this.sysPermissions[i].selected = this.sysSelected[i]
        // 遍历权限list 修改defaultChecked值
        const setlist = this.sysPermissions[i].actionEntitySetList
        setlist.forEach(item => {
          item.defaultCheck = this.sysSelected[i].some(selected => {
            return selected === item.id
          })
        })
      }
    },
    /**
     * CheckBox选择事件
     */
    bizcheckChange () {
      for (var i in this.bizSelected) {
        this.bizPermissions[i].selected = this.bizSelected[i]
        // 遍历权限list 修改defaultChecked值
        const setlist = this.bizPermissions[i].actionEntitySetList
        setlist.forEach(item => {
          item.defaultCheck = this.bizSelected[i].some(selected => {
            return selected === item.id
          })
        })
      }
    },
    /**
     * 权限分配弹出框
     */
    handlePermission (record) {
      this.mdl = Object.assign({}, record)
      getRolePermission({ id: this.mdl.id }).then(res => {
        this.basePermissions = this.setSelectData(res.result.base)
        this.sysPermissions = this.setSelectData(res.result.system)
        this.bizPermissions = this.setSelectData(res.result.biz)
        this.baseSelected = []
        // 把权限表遍历一遍，设定要勾选的权限 action
        this.basePermissions.forEach(permission => {
          this.baseSelected.push(permission.selected)
        })
        this.sysSelected = []
        // 把权限表遍历一遍，设定要勾选的权限 action
        this.sysPermissions.forEach(permission => {
          this.sysSelected.push(permission.selected)
        })
        this.bizSelected = []
        // 把权限表遍历一遍，设定要勾选的权限 action
        this.bizPermissions.forEach(permission => {
          this.bizSelected.push(permission.selected)
        })
        this.perVisible = true
      })
    },
    /**
     * 根据数据结构中actionEntitySetList，check是true即有权限的按钮
     * 将其有权限的信息取出来分别放到basePermissions/systemPermissions/bizPermissions
     */
    setSelectData (permissions) {
      const permissionsAction = {}
      permissions.forEach(permission => {
        // 过滤需要选中的多选框
        const defaultcheck = permission.actionEntitySetList.filter(entity => entity.defaultCheck === true)
        permissionsAction[permission.menuId] = defaultcheck.map((entity, i) => entity.id)
        // 指定多选框的隐藏值和显示值
        // key 值在后面添加index 以保证其唯一性
        permission.actionEntitySetList.forEach((per, i) => {
          per.value = per.id
          per.label = per.description
        })
        // 把权限表遍历一遍，设定要勾选的权限 action
        permissions.forEach(permission => {
          const selected = permissionsAction[permission.menuId]
          permission.selected = selected || []
        })
      })
      return permissions
    },
    /**
     * 编辑权限信息保存
     */
    handlePerOk () {
      this.mdl.permissions = [...this.basePermissions, ...this.sysPermissions, ...this.bizPermissions]
      const _this = this
      _this.confirmLoading = true
      return updateRolePermission({ id: this.mdl.id, permissionList: this.mdl.permissions })
        .then(res => {
          if (res.status === 200) {
            _this.$notification['success']({
              message: '修改成功',
              duration: 2
            })
            // 关闭编辑框
            _this.perVisible = false
          } else {
            _this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        })
        .catch(() =>
          _this.$notification['error']({
            message: '出现异常，请联系系统管理员',
            duration: 4
          })
        )
        .finally(() => {
          _this.confirmLoading = false
        })
    },
    /**
     * 搜索
     */
    searchRole () {
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 编辑弹出框
     */
    handleEdit (record) {
      this.inDetail = false
      this.inAdd = false
      this.inEdit = true
      this.mdl = Object.assign({}, record)
      setTimeout(() => {
        this.editForm.setFieldsValue({
          code: record.code,
          name: record.name,
          description: record.description
        })
      }, 0)
      this.editVisible = true
    },
    /**
     * 新增弹出框
     */
    handleAdd () {
      this.inDetail = false
      this.inEdit = false
      this.inAdd = true
      setTimeout(() => {
        this.editForm.setFieldsValue({
          code: '',
          name: '',
          description: ''
        })
      }, 0)
      this.editVisible = true
    },
    /**
     * 编辑保存
     */
    handleEditOk () {
      if (this.inDetail) {
        this.editVisible = false
        return
      }
      this.editForm.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          if (this.inAdd) {
            // 新增
            return addRole(values)
              .then(res => {
                if (res.status === 200) {
                  this.$notification['success']({
                    message: '操作成功',
                    duration: 2
                  })
                  // 关闭编辑框
                  this.editVisible = false
                  // 刷新列表
                  this.$refs.stable.refresh(true)
                } else {
                  this.$notification['error']({
                    message: res.message,
                    duration: 4
                  })
                }
              })
              .catch(() =>
                this.$notification['error']({
                  message: '出现异常，请联系系统管理员',
                  duration: 4
                })
              )
              .finally(() => {
                this.confirmLoading = false
              })
          } else {
            // 编辑
            values.id = this.mdl.id
            return updateRole(values)
              .then(res => {
                if (res.status === 200) {
                  this.$notification['success']({
                    message: '操作成功',
                    duration: 2
                  })
                  // 关闭编辑框
                  this.editVisible = false
                  // 刷新列表
                  this.$refs.stable.refresh(true)
                } else {
                  this.$notification['error']({
                    message: res.message,
                    duration: 4
                  })
                }
              })
              .catch(() =>
                this.$notification['error']({
                  message: '出现异常，请联系系统管理员',
                  duration: 4
                })
              )
              .finally(() => {
                this.confirmLoading = false
              })
          }
        }
      })
    },
    /**
     * 详情
     */
    rolesDetail (record) {
      this.inDetail = true
      this.mdl = Object.assign({}, record)
      setTimeout(() => {
        this.editForm.setFieldsValue({
          code: record.code,
          name: record.name,
          description: record.description,
          creatorId: record.creatorId,
          createTime: record.createTime
        })
      }, 0)
      this.editVisible = true
    },
    /**
     * 禁用用户
     */
    rolesdisabled (record) {
      this.$confirm({
        title: '警告',
        content: `确认要禁用 ${record.name} 吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          this.confirmLoading = true
          // 在这里调用接口
          return disabledRole(record.id)
            .then(res => {
              if (res.status === 200) {
                this.$notification['success']({
                  message: '禁用成功',
                  duration: 2
                })
              } else {
                this.$notification['error']({
                  message: res.message,
                  duration: 4
                })
              }
            })
            .catch(() =>
              this.$notification['error']({
                message: '出现异常，请联系系统管理员',
                duration: 4
              })
            )
            .finally(() => {
              this.confirmLoading = false
            })
        },
        onCancel: () => {
          this.$notification['info']({
            message: '取消操作',
            duration: 4
          })
        }
      })
    },
    /**
     * 删除用户
     */
    rolesDelete (record) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: `确认要删除 ${record.name} 吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          _this.confirmLoading = true
          // 在这里调用删除接口
          return delRole(record.id)
            .then(res => {
              if (res.status === 200) {
                _this.$notification['success']({
                  message: '删除成功',
                  duration: 2
                })
                _this.$refs.stable.refresh(true)
              } else {
                _this.$notification['error']({
                  message: res.message,
                  duration: 4
                })
              }
            })
            .catch(() =>
              _this.$notification['error']({
                message: '出现异常，请联系系统管理员',
                duration: 4
              })
            )
            .finally(() => {
              _this.confirmLoading = false
            })
        },
        onCancel: () => {
          this.$notification['info']({
            message: '取消删除操作',
            duration: 4
          })
        }
      })
    },
    /**
     * 指定用户
     */
    appointUsers (record) {
      this.roleid = record.id
      return getRoleUser({ id: record.id }).then(res => {
        if (res.status === 200) {
          this.$refs.model.begin(res.result.data)
        } else {
          this.$notification['error']({
            message: '获取人员失败',
            duration: 4
          })
          this.confirmLoading = false
        }
      })
    },
    /**
     * 穿梭框点击确认
     */
    handleSaveOk (returnData) {
      const ids = returnData.map(item => item.id)
      return saveRoleUser({ id: this.roleid, users: ids.join(',') })
        .then(res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        })
        .catch(() =>
          this.$notification['error']({
            message: '出现异常，请联系系统管理员',
            duration: 4
          })
        )
        .finally(() => {
          this.confirmLoading = false
        })
    }
  }
}
</script>
<style scoped>

</style>
