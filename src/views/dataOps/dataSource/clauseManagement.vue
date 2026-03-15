<!-- 条款管理 -->
<template>
    <div class="clauseManagement-main-class normalSize">
        <div class="clauseManagement-left-class">
            <PartTitle title="条款组列表" no-padding :padding-value="0" :height="60">
                <template #right>
                    <buttonDiv @click="addClauseArr" type="baseSpecial" v-permission="'yzk-add'">
                        <img src="@/assets/ItemImg/xinzen.svg" alt="" style="width: 16px; height: 16px; margin-right: 4px;" />新增条款
                    </buttonDiv>
                </template>
            </PartTitle>
            <el-input :prefix-icon="Search" v-model="searchText" placeholder="条款组名称或编码"
                style="padding: 10px 16px 0; margin-bottom: 16px;" @keyup.enter="getlistGroup">
                <template #suffix>
                    <el-icon class="el-input__icon" @click="handleRefresh" style="cursor: pointer;">
                        <RefreshRight />
                    </el-icon>
                </template>
            </el-input>
            <div class="clauseManagement-left-content-class">
                <div class="content-list" v-for="(item, index) in clauseArr" :key="index"
                    @mouseenter="item.showIcons = true" @mouseleave="item.showIcons = false"
                    :class="{ 'selected': item.selected }" @click="handleClauseItemClick(item, index)">
                    <div class="content-title">
                        <div style="margin-right: auto;">
                            <el-tooltip :content="item.tkmc" placement="top">
                                <span class="ellipsis-text">{{ item.tkmc }}</span>
                            </el-tooltip>
                            <div class="content-tags" v-if="item.jgLevel">
                                <div v-for="tag in item.jgLevel.slice(0, 5)" :key="tag.uuid" class="tag-style"
                                    style="font-size: 12px;border-radius: 4px;" :style="{
                                        backgroundColor: InstitutionalLevel(tag.xmmc, 'formatter').background,
                                        color: InstitutionalLevel(tag.xmmc, 'formatter').color
                                    }">
                                    {{ InstitutionalLevel(tag.xmmc, 'formatter').label }}
                                </div>
                                <el-popover placement="top-start" trigger="hover"  popper-style="max-width: 350px; width: fit-content;">
                                    <template #reference>
                                        <div v-if="item.jgLevel.length > 5" class="count-tag">
                                            +{{ item.jgLevel.length - 5 }}
                                        </div>
                                    </template>
                                    <div class="popover-tags-container">
                                        <div v-for="tag in item.jgLevel.slice(5)" :key="tag.uuid" class="tag-style"
                                            :style="{
                                                backgroundColor: InstitutionalLevel(tag.xmmc, 'formatter').background,
                                                color: InstitutionalLevel(tag.xmmc, 'formatter').color,
                                                marginRight: '5px',
                                                marginBottom: '5px',
                                                padding: '2px 5px',
                                                display: 'inline-block',
                                                borderRadius: '4px',
                                            }">
                                            {{ InstitutionalLevel(tag.xmmc, 'formatter').label }}
                                        </div>
                                    </div>
                                </el-popover>
                            </div>
                        </div>
                        <div style="margin-bottom: auto;" v-show="item.showIcons">
                            <img src="@/assets/ItemImg/editb.svg" alt="编辑" style="cursor: pointer;margin-right: 10px;"
                                @click="editClauseArr(item)" />
                            <img src="@/assets/ItemImg/shanchured.svg" alt="删除" style="cursor: pointer;"
                                @click="handleDeleteItem(item)" />
                        </div>
                    </div>
                    <div class="content-code">
                        <span>条款组编码：{{ item.tkbm }}</span>
                        <div>
                            启用否：
                            <el-switch :active-value="'1'" :inactive-value="'0'" v-model="item.isQy"
                                @click="changeStatus(item.uuid, item.isQy)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="clauseManagement-right-class">
            <div class="clauseManagement-right-bottoms-class">
                <div class="clauseManagement-userList-search-class">
                    <searchForm :modelValue="queryParam" :items="searchItems" :inline="true" labelWidth=""
                        @reset="handleReset" @searchVal="handleSearch"
                        class="clauseManagement-userList-searchForm-class">
                    </searchForm>
                </div>
                <div class="clauseManagement-userList--table-class">
                    <tableAndPageComponent ref="tableRef" apiUrl="/business/TKXXB/listTkzDetail"
                        :queryParams="queryParam" primaryKey="uuid"
                        class="clauseManagement-userList-tableAndPageComponent-class" :btnList="operationList"
                        :light="true" :defaultExpandAll='true' :designTableColumns="designTableUserColumns"
                        @btnClick="buttonClick" @selection-change="handleSelectionChange" @row-click="rowClick"
                        @statusClick="switchChange" v-bind="{ showBorder: 1, pageOpen: 0 }">
                    </tableAndPageComponent>
                </div>
            </div>
        </div>
        <SzycDialog :dialogVisible="addArrShow" width="40%" @close="arrBottomClick({ text: '取消' })" :title="arrTitle"
            :alignCenter="true" :canClose="true" :destroy-on-close="true">
            <template #uname>
                <el-form :rules="arrRules" :model="arrform" ref="arrformm" label-position="right" label-width="140px"
                    class="arrForm">
                    <el-form-item label="条款组名称：" prop="tkmc" style="width: 85%">
                        <el-input v-model="arrform.tkmc" placeholder="请输入" clearable />
                    </el-form-item>
                    <el-form-item label="条款组编码：" prop="tkbm" style="width: 98%">
                        <div style="display: flex; align-items: center; width: 100%;">
                            <el-input v-model="arrform.tkbm" disabled />
                            <el-button class="custom-button" @click="generateCode()" style="margin-left: 5px;">
                                <img src="/src/assets/ItemImg/shengchengbianma.svg" style="margin-right: 5px;" /> 生成编码
                            </el-button>
                        </div>
                    </el-form-item>
                    <el-form-item label="绑定机构等级：" prop="jgLevelUuids" style="width: 85%">
                        <el-select v-model="arrform.jgLevelUuids" placeholder="请选择" clearable @change="" multiple
                            collapse-tags :max-collapse-tags="4" collapse-tags-tooltip>
                            <el-option v-for="item in clauseLevelList" :key="item.uuid" :label="item.xmmc"
                                :value="item.uuid" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="备注：" prop="bz" style="width: 85%">
                        <el-input v-model="arrform.bz" :rows="3" type="textarea" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item label="启用否：" prop="isQy" style="width: 85%">
                        <el-switch v-model="arrform.isQy" :active-value="'1'" :inactive-value="'0'" />
                    </el-form-item>
                    <div class="el-dialog-HorizontalLine"></div>
                    <div class="el-dialog-buttons">
                        <CanCelBtn @click="arrBottomClick({ text: '取消' })">取消 </CanCelBtn>
                        <buttonDiv @click="arrBottomClick({ text: '确定' })">确定 </buttonDiv>
                    </div>
                </el-form>
            </template>
        </SzycDialog>

        <SzycDialog :dialogVisible="clauseShow" width="40%" @close="clauseBottomClick({ text: '取消' })"
            :title="clauseTitle" :alignCenter="true" :canClose="true" :destroy-on-close="true">
            <template #uname>
                <el-form :rules="clauseRules" :model="clauseForm" ref="clauseformm" label-position="right"
                    label-width="170px" class="clauseForm">
                    <el-form-item label="条款组名称：" prop="tkzmc">
                        <el-input v-model="tkzmc" disabled />
                    </el-form-item>
                    <el-form-item label="父级条款明细：" prop="fjuuid" v-if="showFatherClause">
                        <el-tree-select v-model="clauseForm.fjuuid"
                            :data="clauseTitle === '编辑' ? filteredTableArr : tableArr"
                            :props="{ label: 'tkmc', children: 'children' }" :render-after-expand="false"
                            node-key="uuid" :check-strictly="true" placeholder="请选择"
                            @node-click="handleTreeNodeClick" />
                    </el-form-item>
                    <el-form-item label="条款组明细名称：" prop="tkmc">
                        <el-input v-model="clauseForm.tkmc" clearable />
                    </el-form-item>
                    <el-form-item label="条款组明细编码：" prop="tkbm">
                        <el-input v-model="clauseForm.tkbm" clearable />
                    </el-form-item>
                    <el-form-item label="条款级别：" prop="bz">
                        <el-select v-model="clauseForm.bz" placeholder="请选择" clearable @change="" disabled>
                            <el-option v-for="item in mxLevelList" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="显示排序：" prop="showindex">
                        <el-input-number v-model="clauseForm.showindex" :min="1" :max="500" />
                    </el-form-item>
                    <el-form-item label="启用否：" prop="isQy">
                        <el-switch v-model="clauseForm.isQy" :active-value="'1'" :inactive-value="'0'" />
                    </el-form-item>
                    <div class="el-dialog-HorizontalLine"></div>
                    <div class="el-dialog-buttons">
                        <CanCelBtn @click="clauseBottomClick({ text: '取消' })">取消 </CanCelBtn>
                        <buttonDiv @click="clauseBottomClick({ text: '确定' })">确定 </buttonDiv>
                    </div>
                </el-form>
            </template>
        </SzycDialog>
    </div>
</template>
<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed, h, markRaw } from "vue";
import tableAndPageComponent from "@/components/table/tableAndPage.vue";
import searchForm from "@/components/element/SearchForm.vue";
import { InstitutionalLevel } from "@/types/dict";
import edit from "@/assets/ItemImg/edit.svg";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from '@element-plus/icons-vue';
import {
    statusFn,
} from "@/types/dict/index.js";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { listGroup, insertGroup, getTkbm, changeGroupStatus, getJgLevel, updateGroup, deleteGroup, listTkzDetail, insertTk, insertZtk, deleteTk, updateTk } from "@/api/clauseManage/index.js"
import { sw } from "element-plus/es/locales.mjs";

const DeleteIconComponent = {
    setup() {
        return () => h('img', {
            src: '/src/assets/image/deleteIcon.svg',
            style: {
                width: '30px',
                height: '25px'
            }
        });
    }
};

// 添加条款组弹窗
const addArrShow = ref(false);
const arrform = reactive({
    tkmc: "",
    tkbm: "",
    jgLevelUuids: [],
    bz: "",
    isQy: '1',
    uuid: ""
})
const arrTitle = ref("");
const arrformm = ref(null);

// 添加条款组明细弹窗
const clauseShow = ref(false)
const clauseTitle = ref("")
const clauseForm = reactive({
    tkzUuid: "",
    fjuuid: "", // 父级条款明细名称
    tkmc: "", // 条款组明细名称
    tkbm: "", // 条款组明细编码
    bz: "", // 条款级别
    showindex: 1, // 显示排序
    isQy: '1'// 启用否
})
const clauseformm = ref(null)
const clauseLevelList = ref([])
const showFatherClause = ref(false)

const filteredTableArr = computed(() => {
    if (!clauseForm.uuid) return tableArr.value;

    // 递归过滤掉当前正在编辑的节点
    const filterNode = (nodes) => {
        return nodes.filter(node => {
            // 过滤掉当前正在编辑的节点
            if (node.uuid === clauseForm.uuid) {
                return false;
            }
            // 如果有子节点，递归过滤子节点
            if (node.children && node.children.length > 0) {
                node.children = filterNode(node.children);
            }
            return true;
        });
    };

    return filterNode(JSON.parse(JSON.stringify(tableArr.value)));
});

const tableRef = ref(null);
const showIcons = ref(false);
const arrRules = reactive({
    tkmc: [
        {
            required: true,
            message: '请输入条款组名称',
            trigger: 'blur',
        },
    ],
    tkbm: [
        {
            required: true,
            message: '请输入条款组编码',
            trigger: 'blur',
        },
    ]
})

const mxLevelList = ref(["一级指标", "二级指标", "三级指标", "四级指标", "五级指标", "六级指标"])

const clauseRules = reactive({
    tkmc: [
        {
            required: true,
            message: '请输入条款组明细名称',
            trigger: 'blur',
        },
    ],
    tkbm: [
        {
            required: true,
            message: '请输入条款组明细编码',
            trigger: 'blur',
        },
    ],
    bz: [
        {
            required: true,
            message: '请输入条款级别',
            trigger: 'blur',
        },
    ],
})
const tableArr = ref([])

const handleTreeNodeClick = (node) => {
    // 强制更新v-model绑定值
    clauseForm.fjuuid = node.uuid;
    console.log(node, mxLevelList.value[ Number(node.tkbm)]);
    clauseForm.bz = mxLevelList.value[ Number(node.tkbm)];
}
const clauseArr = ref([])

const rowClick = (val) => {
    //  console.log("高亮行val", val);
};

const selectionList = ref()
const handleSelectionChange = (val) => {
    selectionList.value = val.map(item => {
        return item.uuid
    });
    console.log("选中行val", val);
};

const searchText = ref("");

const operationList = ref([
    {
        text: "新增条款组明细",
        btnType: "add",
        bind: { type: "baseSpecial" },
    },
    {
        text: "新增子条款组明细",
        btnType: "edit",
        bind: { type: "baseSpecial" },
        permission: 'tkgl-addChild'
    },
    {
        text: "编辑",
        btnType: "edit",
    },
    {
        btnType: "delete",
        // bind: { type: "deleteSpecial" },
        permission: 'tkgl-del'
    },
]);

const getFatherList = async () => {
    let params = {
        uuid: queryParam.uuid,
        tkbm: "",
        tkmc: '',
        isQy: null,
        pageNum: 1,
        pageSize: 999
    }
    let res = await listTkzDetail(params)
    if (res.code == 200) {
        tableArr.value = res.data
    }
}

let editId
const buttonClick = (val, sd) => {
    console.log(sd);
    switch (val.text) {
        case "新增条款组明细":
            clauseShow.value = true;
            // clauseForm.tkzmc = tkzmc;
            clauseTitle.value = val.text;
            showFatherClause.value = false;
            clauseForm.bz = "一级指标";
            break;
        case "新增子条款组明细":
            getFatherList()
            clauseForm.fjuuid = sd.uuid;
            clauseShow.value = true;
            clauseTitle.value = val.text;
            showFatherClause.value = true;
            break;
        case "编辑":
            getFatherList()
            console.log("ssdddd", sd);
            clauseTitle.value = val.text;
            clauseShow.value = true;
            editId = sd.id;
            // 处理编辑逻辑
            // Object.assign(clauseForm, sd);
            clauseForm.fjuuid = sd.fjuuid;
            clauseForm.uuid = sd.uuid;
            clauseForm.tkmc = sd.tkmc;
            clauseForm.tkbm = sd.tkbm;
            clauseForm.bz = sd.bz;
            clauseForm.showindex = sd.showindex;
            clauseForm.isQy = sd.isQy;
            showFatherClause.value = sd.bz === "一级指标" || sd.bz === "章节" ? false : true;
            console.log("clauseForm", clauseForm);
            break;
        case "删除":
            handleDeleteTk(selectionList.value)
            break;
    }
}

const resetClauseForm = () => {
    // 重置表单字段
    clauseForm.fjuuid = "";
    clauseForm.tkmc = "";
    clauseForm.tkbm = "";
    clauseForm.bz = "";
    clauseForm.showindex = 1;
    clauseForm.isQy = '1';
    editId = null;
    clauseShow.value = false;
    showFatherClause.value = false;
};

const clauseBottomClick = async (val) => {
    if (val.text == "取消") {
        resetClauseForm()
    } else if (val.text == "确定" && clauseTitle.value == "新增条款组明细") {
        clauseformm.value.validate(async (valid) => {
            if (valid) {
                let res = await insertTk(clauseForm)
                if (res.code == 200) {
                    ElMessage.success("新增成功")
                    if (tableRef.value) {
                        tableRef.value.fetchData()
                    }
                    resetClauseForm()
                } else {
                    ElMessage.error("新增失败")
                }
            }
        })
    } else if (val.text == "确定" && clauseTitle.value == "新增子条款组明细") {
        clauseformm.value.validate(async (valid) => {
            if (valid) {
                let res = await insertZtk(clauseForm)
                if (res.code == 200) {
                    ElMessage.success("新增成功")
                    if (tableRef.value) {
                        tableRef.value.fetchData()
                    }
                    resetClauseForm()
                } else {
                    ElMessage.error("新增失败")
                }
            }
        })
    } else if (val.text == "确定" && clauseTitle.value == "编辑") {
        clauseformm.value.validate(async (valid) => {
            if (valid) {
                console.log(clauseForm);
                let params = {
                    id: editId,
                    uuid: clauseForm.uuid,
                    tkmc: clauseForm.tkmc,
                    tkbm: clauseForm.tkbm,
                    bz: clauseForm.bz,
                    showindex: clauseForm.showindex,
                    isQy: clauseForm.isQy,
                    fjuuid: clauseForm.fjuuid,
                    tkzUuid: clauseForm.tkzUuid
                }
                let res = await updateTk(params)
                if (res.code == 200) {
                    ElMessage.success("编辑成功")
                    if (tableRef.value) {
                        tableRef.value.fetchData()
                    }
                    resetClauseForm()
                }
            }
        })
    }
}

const queryParam = reactive({
    uuid: "",
    tkbm: "", //  明细编码
    tkmc: '', //  明细名称
    isQy: null, //  启用否
})

const searchItems = ref([
    {
        component: "el-input",
        label: "条款组明细编码：",
        style: { width: "200px" },
        prop: "tkbm",
        attrs: { placeholder: "" },
    },
    {
        component: "el-input",
        label: "条款组明细名称：",
        style: { width: "200px" },
        prop: "tkmc",
        attrs: { placeholder: "" },
    },
    {
        component: "el-select",
        label: "启用否：",
        style: { width: "200px" },
        prop: "isQy",
        attrs: { placeholder: "请选择" },
        options: statusFn()
    }
]);


//  表格数据
const designTableUserColumns = ref([
    {
        columnLabel: "条款组明细编码",
        columnName: "tkbm",
        columnWidth: "250",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "条款组明细名称",
        columnName: "tkmc",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "条款组明细拼音码",
        columnName: "tkmcpy",
        align: "left",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "条款级别",
        columnName: "bz",
        columnWidth: "180",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "启用否",
        columnName: "isQy",
        columnWidth: "180",
        align: "center",
        showOverflowTooltip: true,
        kyf: 1,
        attrs: {
            "active-value": '1',
            "inactive-value": '0',
        }
    },
]);


const userSelectionList = ref([]);
//  查询
const handleReset = () => {
    if (!tableRef.value) return;
    tableRef.value.fetchData();
};

const handleRefresh = () => {
    searchText.value = ""
    getlistGroup();
}


const handleSearch = () => {
    console.log("重置");
    if (!tableRef.value) return;
    tableRef.value.fetchData("重置");
};

/* 条款组弹窗 */
const addClauseArr = (a) => {
    generateCode()
    addArrShow.value = true
    arrTitle.value = "新增条款组"
}
const editClauseArr = (a) => {
    console.log(a);
    console.log(arrform);
    Object.keys(arrform).forEach(key => {
        arrform[key] = a[key];
    });
    if (a.jgLevel) {
        arrform.jgLevelUuids = a.jgLevel.map(item => {
            return item.uuid
        })
    }
    addArrShow.value = true
    arrTitle.value = "修改条款组"
}


const handleDeleteItem = (val) => {
    ElMessageBox.confirm(
        `此操作将永久删除所选内容，无法恢复。确定删除吗？`,
        "删除",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: 'custom-confirm-box',
            icon: markRaw(DeleteIconComponent),
        }
    ).then(async () => {
        let res = await deleteGroup({ uuid: val.uuid })
        if (res.code == 200) {
            ElMessage.success("删除成功")
            getlistGroup()
        } else {
            ElMessage.error("删除失败")
        }
    })
        .catch(() => { });
}

const handleDeleteTk = (val) => {
    ElMessageBox.confirm(
        `此操作将永久删除所选内容，无法恢复。确定删除吗？`,
        "删除",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: 'custom-confirm-box',
            icon: markRaw(DeleteIconComponent),
        }
    ).then(async () => {
        let res = await deleteTk({ uuids: val })
        if (res.code == 200) {
            ElMessage.success("删除成功")
            if (tableRef.value) {
                tableRef.value.fetchData();
                tableRef.value.clearSelection();
            }
        } else {
            ElMessage.error("删除失败")
        }
    })
        .catch(() => { });
}

const handleTreeNodeChange = (val) => {
    const findItemByUuid = (arr, uuid) => {
        for (let item of arr) {
            if (item.uuid === uuid) {
                return item;
            }
            // 如果当前项有children且不为空，则递归查找
            if (item.children && item.children.length > 0) {
                const found = findItemByUuid(item.children, uuid);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    // 使用递归查找替代原来的filter方法
    let bzValue = findItemByUuid(tableArr.value, val)?.bz || '';
    switch (bzValue) {
        case "一级指标":
            clauseForm.bz = '二级指标';
            break;
        case "二级指标":
            clauseForm.bz = '三级指标';
            break;
        case "三级指标":
            clauseForm.bz = '四级指标';
            break;
        case "四级指标":
            clauseForm.bz = '五级指标';
            break;
        case "五级指标":
            clauseForm.bz = '六级指标';
            break;
        case "六级指标":
            clauseForm.bz = '六级指标';
            break;
    }
}

// 监听clauseForm.fjuuid的变化，包括初始值
watch(
    () => tableArr.value,
    (newVal) => {
        // 确保tableArr有数据且clauseForm.fjuuid有值时才执行
        if (newVal && newVal.length > 0 && clauseForm.fjuuid) {
            handleTreeNodeChange(clauseForm.fjuuid);
        }
    },
    { deep: true }
)

const arrBottomClick = async (val) => {
    if (val.text == "取消") {
        addArrShow.value = false
        // 清空表单值
        arrform.tkmc = "";
        arrform.tkbm = "";
        arrform.jgLevelUuids = [];
        arrform.bz = "";
        arrform.isQy = '1';
        arrform.uuid = "";
    } else if (val.text == "确定" && arrTitle.value == "新增条款组") {
        arrformm.value.validate(async (valid) => {
            if (valid) {
                let res = await insertGroup(arrform)
                if (res.code == 200) {
                    ElMessage.success("添加成功")
                    getlistGroup()
                    addArrShow.value = false
                } else {
                    ElMessage.error("添加失败")
                }
            }
        })
    } else if (val.text == "确定" && arrTitle.value == "修改条款组") {
        arrformm.value.validate(async (valid) => {
            if (valid) {
                let res = await updateGroup(arrform)
                if (res.code == 200) {
                    ElMessage.success("修改成功")
                    getlistGroup()
                    addArrShow.value = false
                } else {
                    ElMessage.error("修改失败")
                }
            }
        })
    }
}


// 生成编码
const generateCode = async () => {
    let res = await getTkbm({})
    if (res.code == 200) {
        arrform.tkbm = res.msg
    }
}

// 查询条款组
const getlistGroup = async () => {
    let params = {
        tkmc: searchText.value
    }
    let res = await listGroup(params)
    if (res.code == 200) {
        clauseArr.value = res.data
        // 默认选中第一个项目
        if (clauseArr.value.length > 0) {
            // 给每个项目添加showIcons属性
            clauseArr.value.forEach(item => {
                item.showIcons = false
            })
            // 选中第一个项目
            nextTick(() => {
                // 触发第一个项目的点击事件，加载右侧表格数据
                handleClauseItemClick(clauseArr.value[0], 0)
            })
        }
    }
}

let tkzmc = ref("")
// 添加处理条款组项目点击的方法
const handleClauseItemClick = (item, index) => {
    // 更新选中状态样式
    clauseArr.value.forEach((clause, i) => {
        if (i === index) {
            clause.selected = true
        } else {
            clause.selected = false
        }
    })

    // 设置查询参数并刷新右侧表格
    queryParam.uuid = item.uuid
    clauseForm.tkzUuid = item.uuid
    tkzmc.value = item.tkmc
    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.fetchData()
        }
    })
}

// 修改条款组状态
const changeStatus = async (uuid, isQy) => {
    let params = {
        uuid: uuid,
        isQy: isQy === "1" ? "1" : "0"
    }
    let res = await changeGroupStatus(params)
    if (res.code == 200) {
        ElMessage.success(isQy == '1' ? "已启用" : "已禁用")
    } else {
        ElMessage.error("修改失败")
    }
}

// 修改条款明细
const switchChange = async (val) => {
    let params = {
        id: val.row.id,
        uuid: val.row.uuid,
        tkmc: val.row.tkmc,
        tkbm: val.row.tkbm,
        bz: val.row.bz,
        showindex: val.row.showindex,
        isQy: val.value,
        fjuuid: val.row.fjuuid
    }
    console.log(params);
    let res = await updateTk(params)
    if (res.code == 200) {
        ElMessage.success(val.value == '1' ? "已启用" : "已禁用")
    }
}

// 获取机构等级下拉
const getJginfo = async () => {
    let res = await getJgLevel({})
    if (res.code == 200) {
        clauseLevelList.value = res.data
    } else {
        ElMessage.error("获取机构等级失败")
    }
}


onMounted(async () => {
    // if (tableRef.value) {
    //     tableRef.value.fetchData();
    // }
    getlistGroup()
    getJginfo()
});
</script>
<style lang="scss" scoped>
.clauseManagement-main-class {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;

    .clauseManagement-left-class {
        width: 21.187%;
        height: 100%;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
            12px 12px 16px rgba(164, 174, 183, 0.15);

        .clauseManagement-left-top-left-class {
            display: flex;
            align-items: center;
            height: 100%;
            color: #0173eb;

            img {
                width: 16px;
                margin-right: 9px;
            }

            .rolelist-title-class {
                font-size: 16px;
                margin-left: 10px;
                color: rgba(29, 33, 41, 1);
            }
        }

        .clauseManagement-left-top-right-class {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            height: 100%;
            cursor: pointer;

            img {
                width: 16px;
                margin-right: 5px;
            }

            .addrole-title-class {
                font-size: 14px;
                color: rgba(83, 128, 253, 1);
            }
        }

        .clauseManagement-left-top-class {
            height: calc(2.903% - 1px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 3% 5% 3% 0;
            margin: 1% 0;
        }

        .clauseManagement-left-content-class {
            // padding: 20px 16px;
            font-size: 14px;
            height: 85%;
            overflow-y: auto;

            .ellipsis-text {
                display: inline-block;
                max-width: 220px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .content-list {
                padding: 10px 16px;
                border-left: 1px solid transparent;
                cursor: pointer;
                border-top: 1px solid rgba(245, 247, 250, 1);

                .content-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .content-tags {
                    display: flex;
                    margin-top: 8px;

                    .tag-style {
                        // width: 64px;
                        height: 22px;
                        font-size: 14px;
                        // background-color: #FFE2C4;
                        // color: #FF8D1A;
                        text-align: center;
                        padding: 0 2px;
                        margin-right: 5px;
                        border-radius: 2px;
                        line-height: 20px;
                    }

                    .count-tag {
                        min-width: 30px;
                        height: 22px;
                        font-size: 14px;
                        border-radius: 4px;
                        text-align: center;
                        background-color: #e0e0e0 !important;
                        color: #666 !important;
                    }
                }

                .content-code {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #808080;
                    margin-top: 10px;

                    :deep(.el-switch__core) {
                        // width: 32px !important;
                        transform: scale(0.7);
                    }
                }

                &:hover {
                    background: rgba(83, 128, 253, 0.15);
                    border-left: 1px solid rgba(83, 128, 253, 1);
                }

                &.selected {
                    background: rgba(83, 128, 253, 0.15);
                    border-left: 1px solid rgba(83, 128, 253, 1);
                }
            }
        }
    }

    .clauseManagement-right-class {
        height: 100%;
        width: 78.35%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .clauseManagement-right-bottoms-class {
            background-color: #fff;
            height: 100%;
            width: 100%;

            .clauseManagement-userList-search-class {
                width: 100%;
                // height: 58px;
                display: flex;
                align-items: center;

                :deep(.formContentCss .el-form-item) {
                    margin-right: 30px !important;
                }

                .clauseManagement-userList-searchForm-class {
                    box-shadow: none !important;
                    background: none !important;
                }

            }

            .clauseManagement-userList--table-class {
                height: calc(99% - 58px);

                :deep(.tableExpand) {
                    padding: 0 16px 12px;
                }

                .clauseManagement-userList-tableAndPageComponent-class {
                    box-shadow: none !important;
                    background: none !important;
                }

            }
        }
    }
}
</style>