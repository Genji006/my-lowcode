<template>
  <div class="container_home">
    <div class="containerTop">
      <div class="containerTopLeft">
        <div class="Title" style="font-weight: bold;"> 数据源 </div>
        <div class="Title"> 项目/表名 </div>
        <div class="Content">
          <a-tree :show-line="true" :show-icon="true" :default-expanded-keys="['97e336f434524a88a21732874b75eac0']" style="width:100%;height:100%;" :tree-data="treeData" @select="onSelect">
            <template #title="{ dataRef }">
              <template v-if="dataRef.name === '[项]'">
                <span> {{ dataRef.name + dataRef.APPCHNAME}} </span>
              </template>
              <template v-if="dataRef.name === '[表]'">
                <span @dblclick="onDoubleClick(dataRef)">{{`${dataRef.name} ${dataRef.REMARK} ${dataRef.TABLENAME}` }}</span>
              </template>
            </template>
          </a-tree>
        </div>
      </div>
      <div class="containerTopRight">
        <div class="Title" style="font-weight: bold;text-align: center;"> 数据操作台 </div>
        <!-- <div class="Title"> 项目/表名 </div> -->
        <div class="Content">
          <a-collapse v-model:activeKey="activeKey" accordion>
            <a-collapse-panel key="1" header="显示列设置">
              <div class="cardContainer">
                <div v-for="(item,index) in tableData" :key="item.ID" class="tableCard">
                  <div style="text-align: center;position: relative;">
                    <p class="close" style="position: absolute;" @click="closeTable(item.id,item.data.rows[0])"> 关闭 </p>
                    <div class="titleTable" style="border-bottom:1px solid rgba(0, 0, 0, 0.5);display:flex;">
                      <p style="width:100%;text-align:center;">{{ item.data.rows[0].TABLENAME }}</p>
                    </div>
                    <p class="titleTable"> {{ item.data.rows[0].REMARK }} </p>
                  </div>
                  <div class="cardContentHeight">
                    <el-checkbox v-model="item.column.checkout" label="" @change="(e)=>tableOutside(e,index)" /> 全选
                    <div style="width:95%;margin-left:5%;">
                      <p v-for="ite in item.column.rows" :key="ite.ID" style="line-height:30px;">
                        <el-checkbox v-model="ite.checkout" label="" @change="(e)=>tabCheckout(ite.checkout, e)" />
                        {{ ite.COLUMNNAME + '/' + ite.COLUMNCHNAME }}
                        <a-input v-model:value="ite.REMARK" :bordered="false" placeholder="设置别名" />
                      </p>
                    </div>
                  </div>
                  <div style="text-align: end;height:30px;line-height:30px;">
                    <p>合计：{{ item.column.rows.length }} 列 / 选用 {{ item.column.rows.filter(f => f.checkout).length }} 列</p>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="关系设置">
              <div>

              </div>
            </a-collapse-panel>
            <a-collapse-panel key="3" header="条件设置">
              <div>

              </div>
            </a-collapse-panel>
            <a-collapse-panel key="4" header="排序设置">
              <div>

              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </div>
    <div class="containerBottom">
      <div style="display:flex;">
        <p :class="tabKey==='1'?'sqlClassOne':'sqlClassTwo'" @click="SQLTitle('1')"> SQL动态脚本 </p>
        <p :class="tabKey==='2'?'sqlClassOne':'sqlClassTwo'" @click="SQLTitle('2')"> SQL执行结果 </p>
      </div>
      <div v-show="tabKey === '1'">
        <div class="Title">
          <a-button type="text" @click="executeSql"> 执行 </a-button>
        </div>
        <a-textarea :bordered="false" style="resize: none;height:140px" v-model:value="sqlData" />
      </div>
      <div v-show="tabKey === '2'">
        <div class="Title">
          <a-button type="text"> 导出 </a-button>
        </div>
        <a-table :dataSource="dataSource" :columns="columns" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getapptableApi, getapptablebyidApi, executesqlApi } from "@/api/tool"
// import { ElMessage, Modal } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { createVNode } from 'vue';

const treeData = ref([])    //   应用信息树形结构


const activeKey = ref('0')   //   控制折叠面板的显示
const tableData = ref([])  //   显示列设置

const sqlData = ref("")    //   显示sql语句
const tabKey = ref("1")    //   控制tab页的显示
const storeID = ref([])    //   存储选中的表ID

const sqlArr = ref([])     //   存储sql对象数组


const columns = ref([])    //   查询处理的sql数组（表格列）
const dataSource = ref([]) //   查询处理的sql数组(数据源)


//   获取应用信息
const getTableInfo = () => {
  getapptableApi().then((res) => {
    console.log(JSON.parse(res.APPINFO).rows, "res");
    let curAppInfoRows = JSON.parse(res.APPINFO).rows;
    let curTableRows = JSON.parse(res.APPTABLE).rows;
    console.log(curAppInfoRows, "curAppInfoRows");
    console.log(curTableRows, "curTableRows");
    // 创建一个以ID为键的对象，用于快速查找
    let tableMap = {};
    curTableRows.forEach(table => {
      tableMap[table.ID] = table;
    });

    // 合并成树形结构
    treeData.value = curAppInfoRows.map(app => {
      return {
        ...app,
        icon: "",
        name: "[项]",
        children: curTableRows.filter(table => table.APPINFOID === app.ID).map((e) => {
          return {
            ...e,
            icon: "",
            name: "[表]",
          }
        })
      };
    });
    // console.log(treeData.value, "treeData"); // 输出结果
  })
}



//  双击表
const onDoubleClick = (data) => {
  // console.log(data, "data");
  if (storeID.value.find((f) => f === data.ID)) {
    ElMessage.warning('此表已经存在，无需再次添加！');
  } else {
    getChildrenData(data.ID)
  }
}



const getChildrenData = (id) => {
  let obj = {
    "DATA": {
      "ID": id
    }
  }
  // 获取子节点数据
  getapptablebyidApi(obj).then((res) => {
    // console.log(res, "res");
    if (res.MSGT === "OK") {
      activeKey.value = '1'
      let column = JSON.parse(res.COLUMNS)
      let data = JSON.parse(res.DATA)
      // console.log(column, "column");
      // console.log(data, "data");
      column.rows.forEach(item => {
        item['checkout'] = false
      })
      column['checkout'] = false
      // console.log(column, "column");
      tableData.value.push({
        column: column, data: data, id: id,
      })
      storeID.value.push(id)
    } else {
      ElMessage.error(res.MSG);
    }
  })
}


//  关闭表
const closeTable = (id, data) => {
  ElMessageBox.alert(`是否要移除表${data.TABLENAME}?`, {
    confirmButtonText: '确认',
    callback: (action) => {
      storeID.value = storeID.value.filter((f) => f !== id)
      tableData.value = tableData.value.filter((f) => f.id !== id)
      sqlSentenceFn()
    },
  })
  //   Modal.confirm({
  //     title: `是否要移除表${data.TABLENAME}?`,
  //     icon: createVNode(ExclamationCircleOutlined),
  //     okText: '确认',
  //     cancelText: '取消',
  //     onOk() {
  //       storeID.value = storeID.value.filter((f) => f !== id)
  //       tableData.value = tableData.value.filter((f) => f.id !== id)
  //       sqlSentenceFn()
  //       // console.log('OK');
  //     },
  //     onCancel() {
  //       // console.log('Cancel');
  //     },
  //   });
}



//  点击切换sqlTab
const SQLTitle = (key) => {
  tabKey.value = key
}



//  全选
const tableOutside = (e, index) => {
  // console.log(tableData.value, "tableData.value");
  for (let i = 0; i < tableData.value[index].column.rows.length; i++) {
    if (e) {
      tableData.value[index].column.rows[i].checkout = true
    } else {
      tableData.value[index].column.rows[i].checkout = false
    }
  }
  sqlSentenceFn()
}

// 单选
const tabCheckout = () => {
  sqlSentenceFn()
}

//  处理sql语句
const sqlSentenceFn = () => {
  // console.log(tableData.value, "tableData.value");
  if (tableData.value.length > 0) {
    let outside = {}         //   存储外层数据data
    let index = -1;          //   当未选管路关系时
    let shoNameArr = []      //   存储字符串数组查询的字段
    for (let i = 0; i < tableData.value.length; i++) {
      for (let j = 0; j < tableData.value[i].column.rows.length; j++) {
        if (tableData.value[i].column.rows[j].checkout) {
          let data = tableData.value[i].column.rows[j]
          let str = `${tableData.value[i].data.rows[0].TABLENAME}.${data.COLUMNNAME} as ${data.COLUMNCHNAME}`
          shoNameArr.push(str)
          if (index >= 0) {
            continue
          } else {
            index = i
          }
        }
      }
    }
    if (index < 0) {
      sqlData.value = ""
    } else {
      outside = { ...tableData.value[index].data.rows[0] }
      // console.log(shoNameArr.join(","), "shoNameArr");
      sqlData.value = " select \r\n\t" + shoNameArr.join(",") + " \r\n from \r\n\t" + outside.TABLENAME;
      // console.log(sqlData.value, "sqlData.value");
      // sqlData.value = `select ${shoNameArr.join(",")} * from ${outside.TABLENAME}`
    }
    // console.log(outside, "outside");
  } else {
    ElMessage.warning('请先添加表！');
  }

}

function base64Encode(input) {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // 将字符串转换为 UTF-8 字节
  let utf8Bytes = new TextEncoder().encode(input);
  // 将每个字节转换为二进制字符串
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += utf8Bytes[i].toString(2).padStart(8, '0');
  }
  // 按 6 位拆分
  const chunks = [];
  for (let i = 0; i < binaryString.length; i += 6) {
    chunks.push(binaryString.slice(i, i + 6));
  }
  // 如果最后一组少于 6 位，进行填充
  if (chunks[chunks.length - 1].length < 6) {
    chunks[chunks.length - 1] = chunks[chunks.length - 1].padEnd(6, '0');
  }
  // 查找对应的 Base64 字符
  let base64Encoded = chunks.map(chunk => {
    const index = parseInt(chunk, 2); // 将二进制转换为数字
    return base64Chars.charAt(index);
  }).join('');
  // 添加填充字符
  while (base64Encoded.length % 4 !== 0) {
    base64Encoded += '=';
  }
  return base64Encoded;
}


//  点击执行sql
const executeSql = () => {
  if (sqlData.value) {
    let obj = {
      "DATA": {
        BASE64_SQL: base64Encode(sqlData.value)
      }
    }
    // console.log(obj, "执行的sql语句！")
    // return
    executesqlApi(obj).then((res) => {
      console.log(res, '执行的sql结果！');
      if (res.MSGT === "OK") {

      } else {

      }
    })
  } else {
    ElMessage.warning('对不起，无有效SQL语句！');
  }
}



onMounted(() => {
  getTableInfo()
})

</script>

<style lang="scss" scoped>
.container_home {
  width: 100%;
  height: 100%;
  //   padding: 10px;
  font-size: 15px;
  // background-color: rgba(238, 238, 238, 1);
  box-sizing: border-box;
  height: 100%;
  .containerTop {
    width: 100%;
    height: 70.5%;
    display: flex;
    justify-content: space-between;
    .containerTopLeft {
      width: 30%;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid #ccc;
    }
    .containerTopRight {
      width: 69.5%;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid #ccc;
      .cardContainer {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        max-height: 415px;
        overflow: auto;
      }
      .cardContentHeight {
        background-color: #fff;
        min-height: 100px;
        max-height: 260px;
        overflow: auto;
        flex: 1;
        padding: 2%;
        box-sizing: border-box;
      }
      .close {
        right: 0;
        line-height: 30px;
        text-align: right;
        cursor: pointer;
      }
    }
    .Title {
      line-height: 36px;
      padding-left: 10px;
      height: 36px; /* 顶部和中间部分的高度 */
      border-bottom: 1px solid #ccc;
      background: rgba(245, 245, 245, 1);
    }
    .titleTable {
      line-height: 30px;
    }
    .Content {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
  .containerBottom {
    width: 100%;
    height: 29%;
    margin-top: 0.5%;
    border: 1px solid #ccc;
    overflow: hidden;
    .Title {
      line-height: 30px;
      padding-left: 10px;
      height: 30px; /* 顶部和中间部分的高度 */
      border-top: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      background: rgba(245, 245, 245, 1);
    }
  }
  .sqlClassOne {
    cursor: pointer;
    line-height: 36px;
    padding: 0px 10px 0 10px;
    background-color: rgba(221, 221, 221, 1);
    transition: all 250ms linear;
  }
  .sqlClassTwo {
    cursor: pointer;
    line-height: 36px;
    padding: 0px 10px 0 10px;
    // background-color: rgba(221, 221, 221, 1);
  }
  .tableCard {
    background-color: rgba(194, 204, 209, 1);
    border: 3px;
    padding: 1% 2% 1% 2%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
</style>