<template>
  <div class="talk-setting">
    <a-form :form="form" @submit="handleSubmit" class="group-setting">
      <a-form-item label="名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-input size="small" v-decorator="['name']" disabled/>
      </a-form-item>
      <a-form-item label="密级" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-tag color="orange" v-if="setting.securityClass === '40'">秘密</a-tag>
        <a-tag color="tomato" v-if="setting.securityClass === '60'">机密</a-tag>
        <a-tag color v-if="setting.securityClass === '30'">非密</a-tag>
      </a-form-item>
      <a-form-item label="创建时间" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-input size="small" v-decorator="['createTime']" disabled />
      </a-form-item>
      <a-form-item label="创建人" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-input size="small" v-decorator="['creatorName']" disabled />
      </a-form-item>
      <a-form-item label="主题" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-textarea
          v-decorator="['subject']"
          placeholder="在这输入研讨主题..."
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>
      <a-form-item label="描述" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-textarea
          v-decorator="['description']"
          placeholder="在这输入研讨组描述信息..."
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </a-form-item>
      <a-form-item label="置顶" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-switch disabled defaultChecked v-decorator="['subject']"/>
      </a-form-item>
      <a-form-item label="消息免打扰" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-switch disabled defaultChecked v-decorator="['subject']"/>
      </a-form-item>
    </a-form>
    <div
      :style="{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
      }"
    >
      <a-button type="default" :style="{marginRight: '8px'}">保存</a-button>
      <a-button type="danger" v-if="!isGroupOwner" html-type="submit">退出</a-button>
    </div>
    <!-- <element-footer>
      <a-button type="default" disabled html-type="submit" block>保存修改</a-button>
      <a-button type="danger" v-if="!isGroupOwner" html-type="submit" block>退出研讨组</a-button>
    </element-footer> -->
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getTalksetting } from '@/api/talk.js'
import ElementFooter from '@/components/FooterToolbar/ElementFooter'
const data = ['1', '2', '1', '2', '1', '2']

export default {
  name: 'MoreInfo',
  components: {
    ElementFooter
  },
  data () {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this),
      showMask: false,
      editable: false,
      data,
      // visible: false,
      setting: [],
      items: [],
      userList: []
    }
  },
  computed: {
    ...mapGetters(['isGroupOwner', 'currentTalk'])
  },
  watch: {
  },
  created () {
    this.loadData()
  },
  methods: {
    loadData () {
      getTalksetting(this.currentTalk.id).then(res => {
        const datas = res.result
        this.setting = datas
        setTimeout(() => {
          this.form.setFieldsValue({
            name: this.setting.name,
            createTime: this.setting.createTime,
            creatorName: this.setting.creatorName,
            subject: this.setting.subject,
            description: this.setting.description
          })
        }, 0)
      })
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('修改成功 ', values)
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.group-setting {
  line-height: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}
.talk-setting {
  height: 100%;
}
</style>
