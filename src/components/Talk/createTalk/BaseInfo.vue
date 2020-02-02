<template>
  <div>
    <a-form :form="form" style="max-width: 500px; margin: 40px auto 0;">
      <a-form-item label="群组名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          v-decorator="[
            'groupName',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }, {
                  max: 20,
                  message: '不能超过20个字符'
                }, {
                  whitespace: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          placeholder="研讨组名称"
        />
      </a-form-item>

      <a-form-item label="群组密级" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          v-decorator="[
            'levels',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          placeholder="设置研讨组密级"
        >
          <a-select-option
            v-for="item in secretOption"
            :key="item"
            :value="item"
          >{{ item | fileSecret }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="所属项目" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          v-decorator="[
            'pname',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }, {
                  max: 20,
                  message: '不能超过20个字符'
                }, {
                  whitespace: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          placeholder="请填写研讨组所属项目名称"
        />
      </a-form-item>

      <a-form-item label="群组类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group
          v-decorator="[
            'groupType',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          :options="groupTypes"
        />
      </a-form-item>

      <a-form-item label="参与范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          type="textarea"
          v-decorator="[
            'scop',
            {}
          ]"
          placeholder="填写研讨组讨论范围（可选）"
        />
      </a-form-item>

      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="描述信息">
        <a-input
          type="textarea"
          v-decorator="[
            'groupDescribe',
            {}
          ]"
          placeholder="研讨组的详细信息（可选）"
        />
      </a-form-item>
      <a-form-item :wrapperCol="{span: 20, offset: 4}">
        <a-button type="primary" @click="nextStep">下一步</a-button>
      </a-form-item>
    </a-form>

    <a-divider />
    <div class="step-form-style-desc">
      <h3>说明</h3>
      <h4>请详细填写群组信息</h4>
      <p>研讨内容必须符合保密要求，群组成员需共同承担保密职责</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import pick from 'lodash.pick'

export default {
  name: 'BaseInfo',
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      },
      form: this.$form.createForm(this)
    }
  },
  computed: {
    ...mapGetters([
      'userSecretLevel',
      'userId',
      'avatar',
      'nickname',
      'positions'
    ]),
    secretOption () {
      return [30, 40, 60].filter(item => item <= this.userSecretLevel)
    },
    groupTypes () {
      let typeList = [
        { label: '部门内', value: 0, disabled: false },
        { label: '跨部门', value: 1, disabled: false },
        { label: '跨单位', value: 2, disabled: false }
      ]
      typeList = typeList.map(item => {
        if (this.positions.indexOf(item.value) < 0) {
          item.disabled = true
        }
        return item
      })
      return typeList
    }
  },
  methods: {
    nextStep (e) {
      e.preventDefault()
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.$emit('nextStep', values, 1)
          // console.log('创建的数据：', values)
        }
      })
    },
    setFormData (info) {
      this.form.setFieldsValue(pick(
        info,
        'groupName',
        'levels',
        'pname',
        'groupType',
        'scop',
        'groupDescribe'
      ))
    }
  }
}
</script>

<style lang="less" scoped>
.step-form-style-desc {
  padding: 0 56px;
  color: rgba(0, 0, 0, 0.45);

  h3 {
    margin: 0 0 12px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    line-height: 32px;
  }

  h4 {
    margin: 0 0 4px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    line-height: 22px;
  }

  p {
    margin-top: 0;
    margin-bottom: 12px;
    line-height: 22px;
  }
}
</style>
