<template>
  <div class="account-settings-info-view">
    <a-row :gutter="8">
      <a-col :md="8" :lg="12">
        <a-form layout="vertical" :form="form">
          <a-form-item label="姓名">
            <a-input
              :disabled="true"
              v-decorator="['name']"
            />
          </a-form-item>
          <a-form-item label="组织机构">
            <a-input
              :disabled="true"
              v-decorator="['orgName']"
            />
          </a-form-item>
          <a-form-item label="联系方式">
            <!-- <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="状态"
              hasFeedback
              validateStatus="warning"
            >
              <a-select
                v-decorator="['status', {rules: [{ required: true, message: '请选择状态' }], initialValue: '1'}]"
              >
                <a-select-option :value="1">忙于工作</a-select-option>
                <a-select-option :value="2">出差啦</a-select-option>
                <a-select-option :value="3">休假中</a-select-option>
              </a-select>
            </a-form-item> -->
            <a-input v-decorator="['otel', {rules: [{ pattern: '^[0-9]*$', message: '请输入数字' }, { max: 12, message: '最多填写12位数字' }]}]" />
          </a-form-item>
          <a-form-item label="描述">
            <a-textarea rows="4" v-decorator="['description', {rules: [{ max: 80, message: '最多填写80个字' }]}]" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="submitInfo">提交</a-button>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col :md="8" :lg="4" :style="{ minHeight: '180px' }">
        <div style="margin-left:100px">
          <a-upload
            name="avatar"
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :beforeUpload="beforeUpload"
            @change="handleChange"
            :customRequest="customRequest"
          >
            <img v-if="imageUrl" :src="imageUrl" alt="avatar" style="border-radius: 50%;height: 200px;width:200px" />
            <div v-else>
              <a-icon :type="loading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传头像</div>
            </div>
          </a-upload>
        </div>
      </a-col>
    </a-row>
    <avatar-modal ref="modal" @ok="uploadAvator"></avatar-modal>
  </div>
</template>
<script>
import AvatarModal from './AvatarModal'
import pick from 'lodash.pick'
import { getuser, updateuser, uploadFile } from '@/api/admin'
import { FILE_SERVER_IP } from '@/utils/constants'
export default {
  components: {
    AvatarModal
  },
  data () {
    return {
      form: this.$form.createForm(this),
      // 头像上传进度条
      loading: false,
      // 没有头像默认使用系统头像
      imageUrl: '',
      // 文件名称
      filename: '',
      user: {}
    }
  },
  computed: {
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.user = Object.assign({}, this.userInfo)
    this.getUser()
  },
  methods: {
    getUser () {
      getuser(this.user.id).then(res => {
        if (res.status === 200) {
          this.user = Object.assign({}, res.result)
          this.$nextTick(() => {
            // 表单中绑定信息项
            this.form.setFieldsValue(pick(res.result, 'name', 'orgName', 'otel', 'description'))
            if (this.user.avatar) {
              this.imageUrl = FILE_SERVER_IP + this.user.avatar
            } else {
              this.imageUrl = '/avatar.png'
            }
          })
        }
      })
    },
    /**
     * 重写上传action方法
     */
    customRequest (data) {
      const formData = new FormData()
      formData.append('file', data.file)
      data.onProgress()
      this.getBase64(data.file, imageUrl => {
        this.$refs.modal.edit(imageUrl)
      })
    },
    /**
     * 子组件AvatarModal 点击确认按钮事件
     * 1.上传调整后的图片
     * 2.更新用户头像信息
     */
    uploadAvator (base64) {
      const formData = new FormData()
      formData.append('file', this.dataURLtoFile(base64))
      uploadFile(formData).then(res => {
        if (res.status === 200) {
          const imageUrlTemp = res.result.fullPath
          this.saveInfo({ avatar: imageUrlTemp })
          this.imageUrl = FILE_SERVER_IP + imageUrlTemp
        }
      })
    },
    /**
     * base64转换为文件类型
     */
    dataURLtoFile (dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], this.filename, { type: mime })
    },
    /**
     * 上传组件onchange事件
     */
    handleChange (info) {
      this.filename = info.file.name
      if (info.file.status === 'uploading') {
        this.loading = true
        return
      }
      if (info.file.status === 'done') {
        this.loading = false
      }
    },
    /**
     * 文件url转换base64文件类型
     */
    getBase64 (img, callback) {
      const reader = new FileReader()
      reader.addEventListener('load', () => callback(reader.result))
      reader.readAsDataURL(img)
    },
    /**
     * 上传前文件类型及尺寸的校验
     */
    beforeUpload (file) {
      // 校验上传文件类型
      const isImage =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/bmp'
      if (!isImage) {
        this.$notification['error']({
          message: '支持上传图片类型包含：jpeg/jpg/png/bmp，请注意上传文件的类型',
          duration: 4
        })
      }
      // 校验上传文件尺寸
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$notification['error']({
          message: '请上传尺寸小于2MB的图片',
          duration: 4
        })
      }
      return isImage && isLt2M
    },
    /**
     * 提交校验
     */
    submitInfo () {
      // 触发表单验证
      this.form.validateFields((err, values) => {
        // 验证表单没错误
        if (!err) {
          this.saveInfo(values)
        }
      })
    },
    /**
     * 保存信息到后台
     */
    saveInfo (values) {
      values.id = this.user.id
      values.pid = this.user.pid
      values.name = this.user.name
      delete values.orgName
      updateuser(values)
        .then(res => {
          if (res.status === 200) {
            // 刷新用户信息
            this.$store.dispatch('GetInfo')
            this.$notification['success']({
              message: '提交成功',
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
            message: '发生异常，请联系系统管理员',
            duration: 4
          })
        )
    }
  }
}
</script>
<style lang="less" scoped>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}
.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
a-form-item{
  padding-bottom: 20px
}
</style>
