<template>
  <div class="meeting-base-info">
    <a-form :form="form" style="max-width: 500px; margin: 40px auto 0;">
      <a-form-item label="会议名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
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
          placeholder="会议名称"
        />
      </a-form-item>

      <a-form-item label="会议密级" :labelCol="labelCol" :wrapperCol="wrapperCol">
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
          placeholder="选择会议密级"
        >
          <a-select-option
            v-for="item in secretOption"
            :key="item"
            :value="item"
          >
            {{ item | fileSecret }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="开始时间">
        <a-date-picker
          style="width: 100%"
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="选择开始时间"
          :disabledDate="disabledStartDate"
          @openChange="handleStartOpenChange"
          v-decorator="[
            'beginTime',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
        />
      </a-form-item>

      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="结束时间">
        <a-date-picker
          style="width: 100%"
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="选择结束时间"
          :disabledDate="disabledEndDate"
          :open="endOpen"
          @openChange="handleEndOpenChange"
          v-decorator="[
            'endTime',
            {
              rules: [
                {
                  required: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
        />
      </a-form-item>

      <a-form-item label="成员范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
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
          :options="meetScope"
        />
      </a-form-item>

      <a-form-item label="会议类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          v-decorator="[
            'cross',
            {
              rules: [],
              initialValue: meetTypeList[0].value
            }
          ]"
          placeholder="选择会议类型"
        >
          <a-select-option
            v-for="item in meetTypeList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.title }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="所属项目" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          v-decorator="[
            'pname',
            {
              rules: [
                {
                  max: 20,
                  message: '不能超过20个字符'
                }, {
                  whitespace: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          placeholder="请填写会议所属项目"
        />
      </a-form-item>

      <a-form-item label="组织部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          v-decorator="[
            'org',
            {
              rules: [
                {
                  max: 20,
                  message: '不能超过20个字符'
                }, {
                  whitespace: true,
                  message: '不能为空'
                }
              ]
            }
          ]"
          placeholder="请输入组织会议的部门名称"
        />
      </a-form-item>

      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="参与范围">
        <a-input
          type="textarea"
          v-decorator="[
            'scop'
          ]"
          placeholder="会议参与范围（可选）"
        />
      </a-form-item>

      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="描述信息">
        <a-input
          type="textarea"
          v-decorator="[
            'groupDescribe'
          ]"
          placeholder="会议的详细信息（可选）"
        />
      </a-form-item>
      <a-form-item :wrapperCol="{span: 20, offset: 4}">
        <a-button type="primary" @click="nextStep">下一步</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import pick from 'lodash.pick'
import { TYPE_LIST } from '../modules/constance'

export default {
  name: 'BaseInfo',
  props: {
    meetingInfo: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
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
      form: this.$form.createForm(this),
      /* 会议类型列表 */
      meetTypeList: TYPE_LIST,
      endOpen: false
    }
  },
  computed: {
    ...mapGetters(['userSecretLevel', 'positions']),
    /* 可选择的密级 */
    secretOption () {
      return [30, 40, 60].filter(s => s <= this.userSecretLevel)
    },
    /* 参会人员范围 */
    meetScope () {
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
  mounted () {
    this.setFormData(this.meetingInfo)
  },
  methods: {
    /**
     * 下一步
     */
    nextStep (e) {
      e.preventDefault()
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.$emit('nextStep', values)
        }
      })
    },
    /**
     * 设置表单数据
     */
    setFormData (info) {
      this.form.setFieldsValue(pick(
        info,
        'groupName',
        'pname',
        'scop',
        'groupDescribe',
        'groupType',
        'levels',
        'cross',
        'org',
        'beginTime',
        'endTime'
      ))
    },
    disabledStartDate (startValue) {
      const { endValue } = this.form.getFieldsValue(['endTime'])
      if (!startValue || !endValue) {
        return new Date() > startValue.valueOf()
      }
      return startValue.valueOf() > endValue.valueOf()
    },
    disabledEndDate (endValue) {
      const { beginTime } = this.form.getFieldsValue(['beginTime'])
      if (!endValue || !beginTime) {
        return new Date() > endValue.valueOf()
      }
      return beginTime.valueOf() > endValue.valueOf()
    },
    handleStartOpenChange (open) {
      if (!open) {
        this.endOpen = true
      }
    },
    handleEndOpenChange (open) {
      this.endOpen = open
    }
  }

}
</script>

<style lang="less" scoped>

</style>
