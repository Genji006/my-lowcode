<template>
  <div class="containerS">
    <div class="bg">
      <div class="gslogo">
        <img src="../../assets/loginImg/login-gslogo.svg" />
      </div>
      <div class="welcome">
        <div>HI~欢迎登录</div>
      </div>
      <div class="sz">
        <div class="szleft"></div>
        <div class="szright">
        </div>
      </div>
      <div>
        <!-- 账号密码登录 -->
        <div class="main-right">
          <div class="maintext" style="display: flex; align-items: flex-start">
            <div>欢迎登录</div>
          </div>
          <div class="main-line"></div>
          <div class="main-welcome">WELCOME!</div>
          <div style="
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              margin-top: 24px;
              width: 78.9%;
            ">
            <el-form ref="loginRef" :rules="rules" :model="logininObj" style="width: 100%">
              <el-form-item prop="username">
                <el-input class="useript input" type="text" placeholder="请输入账号" v-model="logininObj.username" @keyup.enter="login" style="width: 100%; height: 52.53px !important">
                  <template #prefix>
                    <div class="input-border">
                      <img src="../../assets/loginImg/login-username.svg" />
                    </div>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input class="useript input" v-model="logininObj.password" type="password" placeholder="请输入密码" show-password @copy.capture.prevent="false" @keyup.enter="login(loginRef)" style="
                    margin-top: 30px;
                    width: 100%;
                    height: 52.53px !important;
                  ">
                  <template #prefix>
                    <div class="input-border">
                      <img src="../../assets/loginImg/login-password.svg" />
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-top: 0px;
              ">
              <div class="reset-password">
                <el-checkbox v-model="ifChecked" style="margin-right: 4px; margin-top: 1px" />
                <div>记住用户名</div>
              </div>
              <div class="reset-password">
                忘记密码?
              </div>
            </div>
            <div style="width: 100%; margin-top: 7%">
              <Confirm class="loginin" type="login" @click="login(loginRef)" @keydown.enter="login(loginRef)">立即登录</Confirm>
            </div>
          </div>
          <!-- <el-tooltip effect="light" popper-class="QRTooltip" content="扫码登录" placement="left-start">
            <div class="QR-box" @click="changeQR">
              <div class="QR-img">
                <img src="../../assets/image/login-QRsmall.svg" />
              </div>
              <div class="QR-tri"></div>
            </div>
          </el-tooltip> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import Confirm from "@/components/element/Confirm.vue";
import { useRouter } from "vue-router";
import { loginApi, userInfoApi, dictApi, getUserInfoApi } from "@/api/index";
import { ElMessage } from "element-plus";
import { useStoreMenu } from "@/store/user";
import { themeStoreMenu } from "@/store/theme";
import { createPasswordPattern } from "@/types/rule/index";
import { dictStore } from "@/store/dict";
import { getZbType } from "@/api/modelIndexManage/indexAllocation";

const dictKey = dictStore()
// import { menuListFn } from '@/utils/menuListFn'
// import { logout } from "@/utils/logout";

const store = useStoreMenu();
// const { menus } = storeToRefs(store);
const router = useRouter();

const ifChecked = ref(false);
// 登录对象
const logininObj = reactive({
  username: '',
  password: '',
  // username: 'caowenmei',
  // password: 'Njyds11.',
})

const loginRef = ref(null);  //  登录表单实例

// 校验
const rules = reactive({
  username: [{ required: true, trigger: "blur", message: "账号不能为空" }],
  password: [
    { required: true, trigger: "blur", message: "密码不能为空" },
    //插入正则验证：大小写、数字、至少8位、不常用字符
    {
      pattern: createPasswordPattern(),
      message: "密码应当在8到16位之间,且含有数字、大小写字母及特殊字符",
    },
  ],
})



//  找到最后一级
function findFirstItemInNestedArray(arr) {
  // 基础情况：如果数组为空，返回null或抛出错误
  if (arr.length === 0) {
    return null; // 或者抛出错误：throw new Error("Array is empty");
  }
  // 获取第一项
  const firstItem = arr[0];
  // console.log(firstItem,"firstItem");

  // 检查第一项是否是一个对象且该对象有子级数组
  if (firstItem && firstItem.children && firstItem.children.length > 0) {
    // 递归调用，查找子级数组的第一项
    return findFirstItemInNestedArray(firstItem.children);
  } else {
    // 如果没有子级数组，返回第一项的值
    return firstItem;
  }
}

//  登录页
const login = async () => {
  let obj = { username: logininObj.username, password: logininObj.password }
  await loginApi(obj)
    .then((res) => {
      if (res.code === 200) {
        store.token = res.token;
        sessionStorage.setItem("token", res.token);
        if (ifChecked.value) {
          localStorage.setItem("userName-dataOps", logininObj.username);
        } else {
          localStorage.removeItem("userName-dataOps");
        }
        // 菜单接口
        userInfoApi().then((response) => {
          // console.log(response,'response');
          if (findFirstItemInNestedArray(response.data)?.path) {
            ElMessage.success('登录成功！')
            setTimeout(() => {
              router.push(findFirstItemInNestedArray(response.data)?.path);
            }, 1000);
          }
        });
        allFn()
      }
    })
};


//  个人信息/字典接口
const allFn = () => {
  getUserInfoApi().then((res) => {
    console.log(res, '个人信息');
    if (res.code == 200) {
      themeStoreMenu().nickName = res.user.nickName
      themeStoreMenu().avatar = res.user.avatar
      themeStoreMenu().logo = 'http://61.155.112.102:9000/dpgk-bucket/png/logo_107d4404172e4ede84ac7a08eca1a038.png'
    }
  })

  let dataSource_arr = ['db_type', 'sys_user_sex', 'fxmx_category']   //  数据源
  let groupCode_arr = ['index_group_business_type', 'index_group_code_table', 'index_group_type']   //  分组编码
  let approve_arr = ['flow_category', 'flow_role', 'node_category']
  let JG_arr = ['JGJB_Opt', 'JGDJ_Opt', 'JGLB_Opt']
  let indexModel_arr = ['indexAttribute', 'indexDefineLevel', 'indexOrientation', 'scriptExecutionType', 'indexType', 'statisticalPeriod', 'dataFormat', 'unitOfMeasurement']   //  指标模型分组编码
  let str_arr = [...dataSource_arr, ...groupCode_arr, ...approve_arr, ...indexModel_arr, ...indexModel_arr, ...JG_arr]   // 所有的字典
  dictApi({ dictType: str_arr.join(',') }).then((res) => {
    console.log(res, '字典数据');
    dictKey.dict = res.data
  })

  // getZbTypeDictData()
}

// 获取指标配置相关字典数据
// const getZbTypeDictData = async () => {
//   // 定义配置数组，包含所有需要获取的字典类型
//   const dictConfig = [
//     { parentCode: "indexDefineLevel", target: "zbVerNumList" },
//     { parentCode: "indexOrientation", target: "zbDirList" },
//     { parentCode: "department", target: "respDptList" },
//     { parentCode: "indexAttribute", target: "zbAttrList" },
//     { parentCode: "scriptExecutionType", target: "scriptTypeList" },
//     { parentCode: "indexType", target: "zbTypeList" },
//     { parentCode: "statisticalPeriod", target: "analPerList" },
//     { parentCode: "dataFormat", target: "dataFmtList" },
//     { parentCode: "unitOfMeasurement", target: "unitList" },
//     { parentCode: "sys_show_type", target: "sysTypeList" },
//   ];

//   // 使用for...of循环获取数据并存储到pinia
//   for (const config of dictConfig) {
//     try {
//       const res = await getZbType({ parentCode: config.parentCode });
//       // 将数据存储到pinia中对应的属性
//       if (res.code === 200 && Array.isArray(res.data)) {
//         dictKey[config.target] = res.data;
//       } else {
//         dictKey[config.target] = [];
//       }
//     } catch (err) {
//       dictKey[config.target] = [];
//     }
//   }
// }


onMounted(() => {
  if (localStorage.getItem('userName-dataOps')) {
    ifChecked.value = true
    logininObj.username = localStorage.getItem('userName-dataOps')
  }
});
</script>
<style lang="scss" scoped>
.containerS {
  height: 100vh;
  width: 100vw;
  .bg {
    background-image: url("../../assets/loginImg/aiLogin.svg");
    display: block;
    position: relative;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 0px 0px;
    width: 100%;
    height: 100%;

    .gslogo {
      position: absolute;
      left: 5%;
      top: 9.4%;
      // width: 100%;
      // height: 100%;
    }

    .welcome {
      position: absolute;
      left: 5%;
      top: 23%;
      height: 54px;
      text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.5);
      /** 文本1 */
      font-size: 41px;
      font-weight: 400;
      letter-spacing: 0px;
      line-height: 50px;
      color: #000;
      text-align: left;
      vertical-align: top;
    }
    .sz {
      position: absolute;
      bottom: 2.3%;
      left: 5%;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0px;
      color: rgba(115, 117, 122, 1);
      text-align: center;
      vertical-align: middle;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .szleft {
      height: 44px;
      width: 41px;
      background-image: url("../../assets/loginImg/login-gslogo-grey.svg");
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    .szright {
      text-align: left;
      margin-left: 8px;
      .szname {
        color: rgba(115, 117, 122, 1);
      }
      .sznumber {
        color: rgba(115, 117, 122, 1);
      }
    }
    .main-right {
      position: absolute;
      top: 23%;
      right: 4%;
      height: 58.3%;
      width: 23.9%;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid rgba(255, 255, 255, 1);
      box-shadow: -1px 0px 16px rgba(207, 214, 227, 1);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;

      .maintext {
        font-size: 34.38px;
        font-weight: 700;
        letter-spacing: 0px;
        line-height: 49.79px;
        color: rgba(29, 33, 41, 1);
        text-align: left;
        vertical-align: top;
        margin-top: 13.6%;
      }

      .main-line {
        width: 137.88px;
        height: 2px;
        opacity: 1;
        transform: rotate(180deg);
        background: rgba(8, 72, 253, 1);
      }

      .main-welcome {
        font-size: 15.28px;
        font-weight: 400;
        letter-spacing: 0px;
        line-height: 22.13px;
        color: rgba(29, 33, 41, 0.7);
        text-align: left;
        vertical-align: top;
        margin-top: 11px;
      }

      .input-border {
        height: 26.74px;
        border-right: 0.96px solid rgba(8, 72, 253, 0.6);
        display: flex;
        align-items: center;
        padding-right: 15px;
      }

      .useript {
        border: none;
        width: 100%;
        margin-top: 0.9%;
      }

      .reset-password {
        font-size: 16px;
        font-weight: 400;
        letter-spacing: 0px;
        line-height: 22px;
        color: rgba(29, 33, 41, 0.7);
        text-align: right;
        vertical-align: middle;
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      input::-webkit-input-placeholder {
        color: #97999b;
      }
      input:focus {
        outline: none;
      }
      .loginin {
        width: 100%;
      }
    }
  }
}
</style>
