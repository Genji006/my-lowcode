<template>
  <div class="institutionCss">
    <div class="topContent cardShadow">
      <!-- <div class="institutionTitle">
        <p class="blueTitleLine"></p>
        <p class="blueTitleFont">机构信息详情</p>
      </div> -->
      <PartTitle title="机构信息详情" no-padding :padding-value="30" :height="50">
        <template #right>
          <div style="display: flex">
            <confirm type="baseSpecial" v-if="submitDisabled" @click="submitDisabled = false" v-permission="'jgxxgl_bj'">
              <el-icon style="margin-right: 5px">
                <EditPen />
              </el-icon>
              编辑
            </confirm>
          </div>
        </template>
      </PartTitle>
      <div style="width: 100%; margin-top: 20px">
        <submitFormData ref="submitRef" :modelValue="submitParams" :showAction="false" :rules="submitRule" :items="submitItems" :inline="true" labelWidth="auto" label-position="right" @cancel="addOrEditShow = false" :formDisabled="submitDisabled">
        </submitFormData>
      </div>
    </div>
    <div class="bottomContent cardShadow">
      <!-- <div class="institutionTitle">
        <p class="blueTitleLine"></p>
        <p class="blueTitleFont">机构文件信息</p>
      </div> -->
      <PartTitle title="机构文件信息" no-padding :padding-value="30" :height="50"></PartTitle>
      <div class="fileUpload">
        <FileUploader class="fileItem" v-model:fileUrl="submitParams.licenseMainTag" label="执业许可证（正本）文件" :elformDisabled="submitDisabled" />
        <FileUploader class="fileItem" v-model:fileUrl="submitParams.licenseNextTag" label="执业许可证(副本)文件" :elformDisabled="submitDisabled" />
        <FileUploader class="fileItem" v-model:fileUrl="submitParams.corproateCertTag" label="事业单位法人证书(正/副)" :elformDisabled="submitDisabled" />
        <FileUploader class="fileItem" v-model:fileUrl="submitParams.busLicenseTag" label="营业执照文件" :elformDisabled="submitDisabled" />
        <FileUploader class="fileItem" v-model:fileUrl="submitParams.approvalDocTag" label="审批文件" :elformDisabled="submitDisabled" />
      </div>
    </div>

    <div style="
          display: flex;
          justify-content: center;
          margin-top: 15px;
          align-items: center;
          position: absolute;
          top: 91%;
          width: 99%;
          background-color: #fff;
          height: 48px;
          border-radius: 4px;
        " v-if="!submitDisabled">
      <!-- <confirm v-if="submitDisabled" @click="submitDisabled = false"> 编辑 </confirm> -->
      <concel type="cancel" @click="
            submitDisabled = true;
            listFn();
          ">
        取消
      </concel>
      <confirm @click="saveInstitutionInfo">
        保存
      </confirm>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import submitFormData from "@/components/element/SubmitForm.vue";
import { yesOrNoFn } from "@/types/dict/index";
import concel from "@/components/element/Confirm.vue";
import confirm from "@/components/element/Confirm.vue";
import {
  listInstitutionApi,
  institutionOptionsApi,
  editInstitutionApi,
  getXzqh,
} from "@/api/system/logManagement.js";
import FileUploader from "./upload.vue";
import { ElMessage } from "element-plus";
import { dictStore } from "@/store/dict.js";

const store = dictStore();
// console.log(store.JGJB_Opt, "store");

const uuid = ref("");
const JGJB_Options = ref([]); //  机构级别
const JGDJ_Options = ref([]); //  机构等级
const JGLB_Options = ref([]); //  机构类别
const gbNameList = ref([]); // 行政区划名称
const submitParams = reactive({
  // 机构名称
  organName: "",
  // 18位统一社会信用代码
  organCode18: "",
  // 执业许可证号
  licenseCode: "",
  // 机构级别
  orgLevel: "",
  // 机构等级
  orgGrade: "",
  // 机构类别
  orgType: "",
  // 机构法定代表人
  legalPerson: "",
  // 单位负责人
  leader: "",
  // 是否省属医院
  onProvince: "",
  // 是否公立医院
  onPublic: "",
  // 是否基层单位
  onBottom: "",
  // 登记批准机构
  regOrgName: "",
  // 办证日期
  certificatDate: "",
  // 机构地址
  orgAddr: "",
  // 有效期限（开始时间）
  validityPeriod: [],
  // 诊疗科目
  treatSubject: "",
  // 行政区划名称
  gbCode: "",
  gbName: "",
});

let formWidth = { width: `calc(25% - 32px)` }; // 每个表单项宽度
const submitDisabled = ref(true); // 是否禁用启用
const submitItems = computed(() => [
  {
    component: "el-input",
    label: "机构名称：",
    prop: "organName",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-select",
    label: "机构类别：",
    prop: "orgType",
    options: JGLB_Options.value,
    optionValue: "code",
    optionLabel: "name",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请选择",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-select",
    label: "机构等次：",
    prop: "orgGrade",
    options: JGDJ_Options.value,
    style: { width: "100%" },
    formWidth: formWidth,
    optionValue: "code",
    optionLabel: "name",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-select",
    label: "机构级别：",
    prop: "orgLevel",
    style: { width: "100%" },
    formWidth: formWidth,
    options: JGJB_Options.value,
    optionValue: "code",
    optionLabel: "name",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "机构地址：",
    prop: "orgAddr",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "18位统一社会信用代码：",
    prop: "organCode18",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "执业许可证号：",
    prop: "licenseCode",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "登记批准机构：",
    prop: "regOrgName",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "单位负责人：",
    prop: "leader",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-input",
    label: "机构法定代表人：",
    prop: "legalPerson",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-date-picker",
    label: "办证日期：",
    prop: "certificatDate",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "请选择",
      clearable: true,
      disabled: submitDisabled.value,
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
  },
  {
    component: "el-date-picker",
    label: "有效期限：",
    prop: "validityPeriod",
    style: { width: "100%" },
    formWidth: formWidth,
    attrs: {
      placeholder: "",
      clearable: true,
      disabled: submitDisabled.value,
      type: "daterange",
      "value-format": "YYYY-MM-DD",
      "range-separator": "至",
      "start-placeholder": "开始时间",
      "end-placeholder": "结束时间",
    },
  },
  {
    component: "el-cascader",
    label: "行政区划名称：",
    prop: "gbCode",
    style: { width: "100%" },
    formWidth: formWidth,
    options: gbNameList.value,
    props: { value: 'code', label: 'name', children: 'children', emitPath: false },
    attrs: {
      placeholder: "请选择",
      clearable: true,
      filterable: true,
      disabled: submitDisabled.value,
    },
  },
  {
    component: "el-radio-group",
    label: "是否省属医院：",
    prop: "onProvince",
    style: { width: "100%" },
    formWidth: formWidth,
    options: yesOrNoFn(),
    disabled: submitDisabled.value,
  },
  {
    component: "el-radio-group",
    label: "是否公立医院：",
    prop: "onPublic",
    style: { width: "100%" },
    formWidth: formWidth,
    options: yesOrNoFn(),
    disabled: submitDisabled.value,
  },
  {
    component: "el-radio-group",
    label: "是否基层单位：",
    prop: "onBottom",
    style: { width: "100%" },
    formWidth: formWidth,
    options: yesOrNoFn(),
    disabled: submitDisabled.value,
  },
  {
    component: "el-input",
    label: "诊疗科目：",
    prop: "treatSubject",
    style: { width: "100%" },
    formWidth: { width: `calc(100% - 32px)` },
    attrs: {
      placeholder: "请输入",
      clearable: true,
      disabled: submitDisabled.value,
    },
  },
]);

const submitRule = reactive({
  organName: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
  organCode18: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
});

// // 双击编辑页面
// const handleEdit = () => {
//   submitDisabled.value = false
// }

const listFn = () => {
  listInstitutionApi().then((res) => {
    uuid.value = res.data.uuid;
    let obj = {
      ...res.data,
      validityPeriod:
        res.data.startDate && res.data.stopDate
          ? [res.data.startDate, res.data.stopDate]
          : [],
    };
    Object.assign(submitParams, obj);
  });
};

const institutionOptionsApiOptions = () => {
  // console.log(store.dict.JGJB_Opt,"store.dict.JGJB_Opt")
  // console.log(store.dict.JGDJ_Opt,"store.dict.JGDJ_Opt")
  // console.log(store.dict.JGLB_Opt,"store.dict.JGLB_Opt")
  // institutionOptionsApi(arrList).then((res) => {
  console.log(store.dict,"store.dict");

  JGJB_Options.value = JSON.parse(JSON.stringify(store.dict.JGJB_Opt || []));   // 机构级别
  JGDJ_Options.value = JSON.parse(JSON.stringify(store.dict.JGDJ_Opt || []));   // 机构等次
  JGLB_Options.value = JSON.parse(JSON.stringify(store.dict.JGLB_Opt || []));   // 机构类别
  // })
};

const saveInstitutionInfo = () => {
  // console.log(submitParams, "submitParams");
  let gbName = ""
  if (submitParams.gbCode) {
    const findName = (list) => {
      for (let item of list) {
        if (item.code == submitParams.gbCode) {
          return item.name;
        }
        if (item.children) {
          const name = findName(item.children);
          if (name) return name;
        }
      }
      return '';
    };

    gbName = findName(gbNameList.value) || '';
  } else {
    gbName = '';
  }

  let obj = {
    uuid: uuid.value,
    ...submitParams,
    gbName: gbName,
    startDate:
      submitParams.validityPeriod.length > 0
        ? submitParams.validityPeriod[0]
        : "",
    stopDate:
      submitParams.validityPeriod.length > 0
        ? submitParams.validityPeriod[1]
        : "",
  };
  editInstitutionApi(obj).then((res) => {
    if (res.code === 200) {
      listFn();
      submitDisabled.value = true;
      ElMessage.success("保存成功!");
    }
  });
};

const getXzqhFn = async () => {
  let res = await getXzqh({});
  if (res.code === 200) {
    gbNameList.value = res.data
  }
};

onMounted(async () => {
  institutionOptionsApiOptions();
  await listFn();
  await getXzqhFn();
});
</script>

<style lang="scss" scoped>
.institutionCss {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .topContent {
    padding: 16px 30px;
    flex-shrink: 0;
    box-sizing: border-box;
    margin-bottom: 15px;
    .institutionTitle {
      display: flex;
      p {
        font-size: 16px;
        font-weight: bold;
      }
    }
    :deep(.el-radio__input.is-disabled.is-checked .el-radio__inner:after) {
      background-color: #fff;
    }
    :deep(.el-form-item) {
      margin: 15px 15px 5px;
    }
  }
  .bottomContent {
    height: 49%;
    // flex-grow: 1;
    padding: 16px 30px;
    box-sizing: border-box;
    .institutionTitle {
      display: flex;
      p {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .fileUpload {
      width: calc(95% - 32px);
      margin-top: 25px;
      height: calc(100% - 55px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 3%;
    }
    .fileItem {
      width: 18%;
      height: 100%;
      // background-color: rgba(240, 240, 240, 1);
    }
  }
}
</style>

<style lang="scss">
.institutionCss {
  .el-radio__input.is-checked .el-radio__inner {
    background: rgba(0, 115, 237, 0.5);
    border-color: rgba(0, 115, 237, 0.5);
    width: 14px;
    height: 14px;
  }
  .el-radio__inner:after {
    width: 6px;
    height: 6px;
  }
}
</style>

