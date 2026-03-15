<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="FTPS 上传"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div>
                <el-form :model="form" label-width="100px" class="mxgraphForm">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.label" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab">
                        <el-tab-pane label="一般" name="general" class="tabItem">
                            <el-form label-position="right" label-width="180px">
                                <el-divider content-position="left">服务器设置</el-divider>
                                <el-form-item label="FTP服务器名称/IP地址：">
                                    <el-input v-model="form.servername" placeholder="请输入FTP服务器名称或IP地址"></el-input>
                                </el-form-item>
                                <el-form-item label="端口：">
                                    <el-input v-model="form.serverport" placeholder="请输入端口号"></el-input>
                                </el-form-item>
                                <el-form-item label="用户名：">
                                    <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="密码：">
                                    <el-input v-model="form.password" placeholder="请输入密码"></el-input>
                                </el-form-item>
                                <el-form-item label="代理主机：">
                                    <el-input v-model="form.proxyserver" placeholder="请输入代理主机"></el-input>
                                </el-form-item>
                                <el-form-item label="代理端口：">
                                    <el-input v-model="form.proxyserverport" placeholder="请输入代理端口"></el-input>
                                </el-form-item>
                                <el-form-item label="代理用户名：">
                                    <el-input v-model="form.proxyserverusername" placeholder="请输入代理用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="代理密码：">
                                    <div style="display: flex;">
                                        <el-input v-model="form.proxyserverpwd" placeholder="请输入代理密码"
                                            style="width: 265px;"></el-input>
                                        <el-button @click="testConnection" style="margin-left: 10px;">测试连接</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="连接类型：">
                                    <el-select v-model="form.connectiontype" placeholder="请选择连接类型">
                                        <el-option v-for="item in connectiontype" :key="item.name" :label="item.name"
                                            :value="item.name"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-divider content-position="left">高级设置</el-divider>
                                <el-form-item label="二进制模式：">
                                    <el-checkbox v-model="form.binarymode"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="超时：">
                                    <el-input v-model="form.timeout" placeholder="请输入超时时间"></el-input>
                                </el-form-item>
                                <el-form-item label="使用活动的FTP连接：">
                                    <el-checkbox v-model="form.usealiveftpconnection"></el-checkbox>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="文件" name="file" class="tabItem">
                            <el-form label-position="right" label-width="180px">
                                <el-divider content-position="left">源（本地）文件</el-divider>
                                <el-form-item label="本地目录：">
                                    <el-input v-model="form.localdir" placeholder="请输入本地目录">
                                        <template #append>
                                            <el-button @click="openFileExplorer('local')">浏览</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="通配符：">
                                    <el-input v-model="form.tongpeifu" placeholder="请输入通配符"></el-input>
                                </el-form-item>
                                <el-form-item label="上传文件后删除本地文件：">
                                    <el-checkbox v-model="form.dellocalfilesafterupload"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="不覆盖文件：">
                                    <el-checkbox v-model="form.notcoverremotefiles"></el-checkbox>
                                </el-form-item>
                                <el-divider content-position="left">目标（远程）文件</el-divider>
                                <el-form-item label="远程目录：">
                                    <div style="display: flex;">
                                        <el-input v-model="form.remotedir" placeholder="请输入远程目录" style="width: 290px;">
                                        </el-input>
                                        <el-button @click="testDirectory" style="margin-left: 10px;">测试目录</el-button>
                                    </div>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import FileExplorerWindow from '../../formItems/tools/FileExplorerWindow.vue';
import { testFtpConnection, testFtpDirectory, getConnectionType } from "@/api/kettleApi";
import { ElMessage } from 'element-plus';

const { mxUtils } = window.mx;

// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("general");
const showFileExplorer = ref(false);
const selectedFileType = ref(''); // 记录当前选择的是哪个目录类型

// 初始化表单数据，使用与FTPS_PUT.js一致的字段名
const form = reactive({
    label: "",
    servername: "",
    serverport: "",
    username: "",
    password: "",
    proxyserver: "",
    proxyserverport: "",
    proxyserverusername: "",
    proxyserverpwd: "",
    connectiontype: "",
    binarymode: false,
    timeout: "",
    usealiveftpconnection: false, // 注意：这是用于读取的字段名
    localdir: "",
    tongpeifu: "",
    dellocalfilesafterupload: false, // 读取时使用dellocalfilesafterupload，写入时使用dellocalfileafterupload
    notcoverremotefiles: false,
    remotedir: ""
});

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
// 获取完整xml
let allXml = null;
let jobName = ref("");

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);

        // 查找 JobEntry 元素
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const value = stepElements[0];

            // 填充表单字段，使用与FTPS_PUT.js一致的字段名
            form.label = value.getAttribute('label') || '';
            form.servername = value.getAttribute('servername') || '';
            form.serverport = value.getAttribute('serverport') || '';
            form.username = value.getAttribute('username') || '';
            form.password = value.getAttribute('password') || '';
            form.proxyserver = value.getAttribute('proxyserver') || '';
            form.proxyserverport = value.getAttribute('proxyserverport') || '';
            form.proxyserverusername = value.getAttribute('proxyserverusername') || '';
            form.proxyserverpwd = value.getAttribute('proxyserverpwd') || '';
            form.connectiontype = value.getAttribute('connectiontype') || '';
            form.binarymode = value.getAttribute('binarymode') === 'Y';
            form.timeout = value.getAttribute('timeout') || '';
            form.usealiveftpconnection = value.getAttribute('usealiveftpconnection') === 'Y'; // 读取时使用这个字段名
            form.localdir = value.getAttribute('localdir') || '';
            form.tongpeifu = value.getAttribute('tongpeifu') || '';
            form.dellocalfilesafterupload = value.getAttribute('dellocalfilesafterupload') === 'Y'; // 读取时使用dellocalfilesafterupload
            form.notcoverremotefiles = value.getAttribute('notcoverremotefiles') === 'Y';
            form.remotedir = value.getAttribute('remotedir') || '';
        }
    } catch (error) {
        console.error('解析stepInfo XML失败:', error);
        ElMessage.error("解析stepInfo XML数据失败");
    }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 JobEntry 元素
        const stepElements = xmlDoc.getElementsByTagName("JobEntry");
        if (stepElements.length > 0) {
            const value = stepElements[0];

            // 更新属性，使用与FTPS_PUT.js一致的字段名
            value.setAttribute("label", form.label);
            value.setAttribute("servername", form.servername);
            value.setAttribute("serverport", form.serverport);
            value.setAttribute("username", form.username);
            value.setAttribute("password", form.password);
            value.setAttribute("proxyserver", form.proxyserver);
            value.setAttribute("proxyserverport", form.proxyserverport);
            value.setAttribute("proxyserverusername", form.proxyserverusername);
            value.setAttribute("proxyserverpwd", form.proxyserverpwd);
            value.setAttribute("connectiontype", form.connectiontype);
            value.setAttribute("binarymode", form.binarymode ? "Y" : "N");
            value.setAttribute("timeout", form.timeout);
            // 写入时使用 getValues 函数中使用的字段名 useraliveftpconnection（注意拼写）
            value.setAttribute("useraliveftpconnection", form.usealiveftpconnection ? "Y" : "N");

            value.setAttribute("localdir", form.localdir);
            value.setAttribute("tongpeifu", form.tongpeifu);
            // 写入时使用 getValues 函数中使用的字段名 dellocalfileafterupload（而不是dellocalfilesafterupload）
            value.setAttribute("dellocalfileafterupload", form.dellocalfilesafterupload ? "Y" : "N");
            value.setAttribute("notcoverremotefiles", form.notcoverremotefiles ? "Y" : "N");
            value.setAttribute("remotedir", form.remotedir);

            // 返回更新后的XML
            return mxUtils.getPrettyXml(value);
        }

        return stepInfoXml; // 如果没有找到step元素，返回原始XML
    } catch (error) {
        console.error("更新stepInfo XML失败:", error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
};

const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph
            .getModel()
            .setValue(currentCell, form.label);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);

        // 将更新后的 XML 数据传递回父组件
        emit("update-step", {
            cell: currentCell,
            updatedXml: currentXml,
        });
    }
    dialogVisible.value = false;
};

const openFileExplorer = (type) => {
    selectedFileType.value = type;
    showFileExplorer.value = true;
};

const handleFileSelected = (path) => {
    if (selectedFileType.value === 'local') {
        form.localdir = path + form.localdir;
    }
    showFileExplorer.value = false;
};

const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        allXml = data.allXml;
        jobName.value = data.jobName;
        // 将节点当前名称设置到表单中
        form.label = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getSFTPConnection()
    }
    dialogVisible.value = true;
};

const updateNodeInFullXml = (fullXml, nodeId, updatedNodeXml) => {
    try {
        // 解析完整的XML
        let fullXmlDoc = mxUtils.parseXml(fullXml);
        let entries = fullXmlDoc.getElementsByTagName('JobEntry');

        for (let i = 0; i < entries.length; i++) {
            if (entries[i].getAttribute('name') === nodeId ||
                entries[i].getAttribute('id') === nodeId ||
                entries[i].getAttribute('label') === form.label) {

                // 替换为更新后的节点XML
                let updatedNodeDoc = mxUtils.parseXml(updatedNodeXml);
                let newNode = updatedNodeDoc.documentElement;

                // 复制新节点的所有属性到原节点
                for (let j = 0; j < newNode.attributes.length; j++) {
                    let attr = newNode.attributes[j];
                    entries[i].setAttribute(attr.name, attr.value);
                }

                break;
            }
        }

        // 返回更新后的完整XML
        return mxUtils.getPrettyXml(fullXmlDoc.documentElement);
    } catch (error) {
        console.error("更新完整XML失败:", error);
        // 如果出错，则返回原始XML
        return fullXml;
    }
}

// 测试FTP连接
const testConnection = async () => {
    if (!currentGraph || !currentCell) {
        console.error("缺少图或节点信息");
        ElMessage.error("缺少图或节点信息");
        return;
    }

    // 首先保存当前配置
    if (currentXml) {
        currentXml = updateStepInfoXml(currentXml);
    }

    // 将更新后的节点XML合并到完整的allXml中
    let mergedXml = allXml;
    if (allXml && currentXml) {
        mergedXml = updateNodeInFullXml(allXml, currentCell.getId(), currentXml);
    }

    try {
        let res = await testFtpConnection({
            graphXml: mergedXml,
            stepName: form.label,
        });

        ElMessage({
            message: res.message || res.title || '',
            type: res.success ? 'success' : 'error',
            plain: true,
        });
    } catch (error) {
        console.error('测试FTP连接失败:', error);
        ElMessage.error('测试FTP连接失败');
    }
};

// 测试远程目录
const testDirectory = async () => {
    if (!currentGraph || !currentCell) {
        console.error("缺少图或节点信息");
        ElMessage.error("缺少图或节点信息");
        return;
    }

    // 首先保存当前配置
    if (currentXml) {
        currentXml = updateStepInfoXml(currentXml);
    }

    // 将更新后的节点XML合并到完整的allXml中
    let mergedXml = allXml;
    if (allXml && currentXml) {
        mergedXml = updateNodeInFullXml(allXml, currentCell.getId(), currentXml);
    }

    try {
        let res = await testFtpDirectory({
            graphXml: mergedXml,
            stepName: form.label,
        });

        ElMessage({
            message: res.message || res.title || '',
            type: res.success ? 'success' : 'error',
            plain: true,
        });
    } catch (error) {
        console.error('测试FTP目录失败:', error);
        ElMessage.error('测试FTP目录失败');
    }
};

const connectiontype = ref([]);
// 获取连接类型
const getSFTPConnection = async () => {
    try {
        let res = await getConnectionType({});
        connectiontype.value = res;
    } catch (error) {
        console.error('获取连接类型失败:', error);
        ElMessage.error('获取连接类型失败');
    }
}

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
.tabItem {
    margin-top: 10px;
    height: 600px;
    overflow-y: auto;
}
</style>