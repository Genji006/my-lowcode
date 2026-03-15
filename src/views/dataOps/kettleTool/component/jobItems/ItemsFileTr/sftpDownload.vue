<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="dialogVisible = false" title="SFTP下载"
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
                            <el-form label-position="right" label-width="155px">
                                <el-divider content-position="left">服务器设置</el-divider>
                                <el-form-item label="SFTP服务器名称/IP：">
                                    <el-input v-model="form.servername" placeholder="请输入SFTP服务器名称或IP"></el-input>
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
                                <el-form-item label="使用私钥文件：">
                                    <el-checkbox v-model="form.usekeyfilename"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="私钥文件：" v-if="form.usekeyfilename">
                                    <el-input v-model="form.keyfilename" placeholder="请输入私钥文件路径">
                                        <template #append>
                                            <el-button @click="openFileExplorer('keyfile')">浏览</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="秘钥：" v-if="form.usekeyfilename">
                                    <el-input v-model="form.keyfilepass" placeholder="请输入秘钥"></el-input>
                                </el-form-item>
                                <el-form-item label="代理类型：">
                                    <el-select v-model="form.proxyType" placeholder="请选择代理类型">
                                        <el-option label="HTTP" value="HTTP"></el-option>
                                        <el-option label="SOCKS5" value="SOCKS5"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="代理主机：">
                                    <el-input v-model="form.proxyHost" placeholder="请输入代理主机"></el-input>
                                </el-form-item>
                                <el-form-item label="代理端口：">
                                    <el-input v-model="form.proxyPort" placeholder="请输入代理端口"></el-input>
                                </el-form-item>
                                <el-form-item label="代理用户名：">
                                    <el-input v-model="form.proxyUsername" placeholder="请输入代理用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="代理密码：">
                                    <div style="display: flex;">
                                        <el-input v-model="form.proxyPassword" placeholder="请输入代理密码"
                                            style="width: 385px;"></el-input>
                                        <el-button @click="testConnection" style="margin-left: 10px;">测试连接</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="压缩：">
                                    <el-select v-model="form.compression" placeholder="请选择压缩方式">
                                        <el-option label="none" value="none"></el-option>
                                        <el-option label="zlib" value="zlib"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="文件" name="file" class="tabItem">
                            <el-form label-position="right" label-width="240px">
                                <el-divider content-position="left">源文件</el-divider>
                                <el-form-item label="复制上一个作业项的结果作为参数：">
                                    <el-checkbox v-model="form.copyprevious"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="远程目录：">
                                    <div style="display: flex;">
                                        <el-input v-model="form.sftpdirectory" placeholder="请输入远程目录"
                                            style="width: 285px;">
                                        </el-input>
                                        <el-button @click="testDirectory" style="margin-left: 10px;">测试文件夹</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="通配符(正则表达式)：">
                                    <el-input v-model="form.wildcard" placeholder="请输入通配符"></el-input>
                                </el-form-item>
                                <el-form-item label="获取后删除服务器文件：">
                                    <el-checkbox v-model="form.remove"></el-checkbox>
                                </el-form-item>
                                <el-divider content-position="left">目标文件</el-divider>
                                <el-form-item label="目标目录：">
                                    <el-input v-model="form.targetdirectory" placeholder="请输入目标目录">
                                        <template #append>
                                            <el-button @click="openFileExplorer('target')">浏览</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="创建目标文件：">
                                    <el-checkbox v-model="form.createtargetfolder"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="添加文件名到结果：">
                                    <el-checkbox v-model="form.isaddresult"></el-checkbox>
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
import { testSftpConnection, testSftpDirectory } from "@/api/kettleApi";
import { ElMessage } from 'element-plus';

const { mxUtils } = window.mx;

// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("general");
const showFileExplorer = ref(false);
const selectedFileType = ref(''); // 记录当前选择的是哪个目录类型

// 初始化表单数据，使用与SFTP.js一致的字段名
const form = reactive({
    label: "",
    servername: "",
    serverport: "",
    username: "",
    password: "",
    usekeyfilename: false,
    keyfilename: "",
    keyfilepass: "",
    proxyType: "",
    proxyHost: "",
    proxyPort: "",
    proxyUsername: "",
    proxyPassword: "",
    compression: "",
    copyprevious: false,
    sftpdirectory: "",
    wildcard: "",
    remove: false,
    targetdirectory: "",
    createtargetfolder: false,
    isaddresult: false
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

            // 填充表单字段，使用与SFTP.js一致的字段名
            form.label = value.getAttribute('label') || '';
            form.servername = value.getAttribute('servername') || '';
            form.serverport = value.getAttribute('serverport') || '';
            form.username = value.getAttribute('username') || '';
            form.password = value.getAttribute('password') || '';
            form.usekeyfilename = value.getAttribute('usekeyfilename') === 'Y';
            form.keyfilename = value.getAttribute('keyfilename') || '';
            form.keyfilepass = value.getAttribute('keyfilepass') || '';
            form.proxyType = value.getAttribute('proxyType') || '';
            form.proxyHost = value.getAttribute('proxyHost') || '';
            form.proxyPort = value.getAttribute('proxyPort') || '';
            form.proxyUsername = value.getAttribute('proxyUsername') || '';
            form.proxyPassword = value.getAttribute('proxyPassword') || '';
            form.compression = value.getAttribute('compression') || '';
            form.copyprevious = value.getAttribute('copyprevious') === 'Y';
            form.sftpdirectory = value.getAttribute('sftpdirectory') || '';
            form.wildcard = value.getAttribute('wildcard') || '';
            form.remove = value.getAttribute('remove') === 'Y';
            form.targetdirectory = value.getAttribute('targetdirectory') || '';
            form.createtargetfolder = value.getAttribute('createtargetfolder') === 'Y';
            form.isaddresult = value.getAttribute('isaddresult') === 'Y';
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

            // 更新属性，使用与SFTP.js一致的字段名
            value.setAttribute("label", form.label);
            value.setAttribute("servername", form.servername);
            value.setAttribute("serverport", form.serverport);
            value.setAttribute("username", form.username);
            value.setAttribute("password", form.password);
            value.setAttribute("usekeyfilename", form.usekeyfilename ? "Y" : "N");
            value.setAttribute("keyfilename", form.keyfilename);
            value.setAttribute("keyfilepass", form.keyfilepass);
            value.setAttribute("proxyType", form.proxyType);
            value.setAttribute("proxyHost", form.proxyHost);
            value.setAttribute("proxyPort", form.proxyPort);
            value.setAttribute("proxyUsername", form.proxyUsername);
            value.setAttribute("proxyPassword", form.proxyPassword);
            value.setAttribute("compression", form.compression);
            value.setAttribute("copyprevious", form.copyprevious ? "Y" : "N");
            value.setAttribute("sftpdirectory", form.sftpdirectory);
            value.setAttribute("wildcard", form.wildcard);
            value.setAttribute("remove", form.remove ? "Y" : "N");
            value.setAttribute("targetdirectory", form.targetdirectory);
            value.setAttribute("createtargetfolder", form.createtargetfolder ? "Y" : "N");
            value.setAttribute("isaddresult", form.isaddresult ? "Y" : "N");

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
    if (selectedFileType.value === 'keyfile') {
        form.keyfilename = path;
    } else if (selectedFileType.value === 'target') {
        form.targetdirectory = path;
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

// 测试SFTP连接
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
        // 使用SFTP测试连接接口
        let res = await testSftpConnection({
            graphXml: mergedXml,
            stepName: form.label,
        });

        ElMessage({
            message: res.message || res.title || '',
            type: res.success ? 'success' : 'error',
            plain: true,
        });
    } catch (error) {
        console.error('测试SFTP连接失败:', error);
        ElMessage.error('测试SFTP连接失败');
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
        // 使用SFTP测试目录接口
        let res = await testSftpDirectory({
            graphXml: mergedXml,
            stepName: form.label,
        });

        ElMessage({
            message: res.message || res.title || '',
            type: res.success ? 'success' : 'error',
            plain: true,
        });
    } catch (error) {
        console.error('测试SFTP目录失败:', error);
        ElMessage.error('测试SFTP目录失败');
    }
};

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