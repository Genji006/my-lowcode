<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="FTP删除"
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
                                <el-form-item label="协议：">
                                    <el-select v-model="form.protocol" placeholder="请选择协议">
                                        <el-option label="FTP" value="FTP"></el-option>
                                        <el-option label="FTPS" value="FTPS"></el-option>
                                        <el-option label="SFTP" value="SFTP"></el-option>
                                        <el-option label="SSH" value="SSH"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="FTP服务器名称/IP地址：">
                                    <el-input v-model="form.serverName" placeholder="请输入FTP服务器名称或IP地址"></el-input>
                                </el-form-item>
                                <el-form-item label="端口：">
                                    <el-input v-model="form.serverPort" placeholder="请输入端口号"></el-input>
                                </el-form-item>
                                <el-form-item label="用户名：">
                                    <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="密码：">
                                    <el-input v-model="form.password" placeholder="请输入密码"></el-input>
                                </el-form-item>
                                <el-form-item label="连接类型：">
                                    <el-select v-model="form.ftps_connection_type" placeholder="请选择连接类型"
                                        :disabled="!isFTPSProtocol">
                                        <el-option label="FTP_CONNECTION" value="0"></el-option>
                                        <el-option label="IMPLICIT_SSL_FTP_CONNECTION" value="1"></el-option>
                                        <el-option label="AUTH_SSL_FTP_CONNECTION" value="2"></el-option>
                                        <el-option label="IMPLICIT_SSL_WITH_CRYPTED_DATA_FTP_CONNECTION"
                                            value="3"></el-option>
                                        <el-option label="AUTH_TLS_FTP_CONNECTION" value="4"></el-option>
                                        <el-option label="IMPLICIT_TLS_FTP_CONNECTION" value="5"></el-option>
                                        <el-option label="IMPLICIT_TLS_WITH_CRYPTED_DATA_FTP_CONNECTION"
                                            value="6"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="使用代理：">
                                    <el-checkbox v-model="form.useproxy"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="代理主机：">
                                    <el-input v-model="form.proxy_host" :disabled="!form.useproxy"
                                        placeholder="请输入代理主机"></el-input>
                                </el-form-item>
                                <el-form-item label="代理端口：">
                                    <el-input v-model="form.proxy_port" :disabled="!form.useproxy"
                                        placeholder="请输入代理端口"></el-input>
                                </el-form-item>
                                <el-form-item label="代理用户名：">
                                    <el-input v-model="form.proxy_username" :disabled="!form.useproxy"
                                        placeholder="请输入代理用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="代理密码：">
                                    <el-input v-model="form.proxy_password" :disabled="!form.useproxy"
                                        placeholder="请输入代理密码"></el-input>
                                </el-form-item>
                                <el-form-item label="使用公钥私钥：">
                                    <el-checkbox v-model="form.publicpublickey"
                                        :disabled="!isSSHProtocol"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="公钥文件：">
                                    <el-input v-model="form.keyfilename" placeholder="请输入公钥文件路径"
                                        :disabled="form.protocol != 'SSH'">
                                        <template #append>
                                            <el-button @click="openFileExplorer('keyfile')"
                                                :disabled="form.protocol != 'SSH'">浏览</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="加密密钥：">
                                    <el-input v-model="form.keyfilepass" placeholder="请输入加密密钥"
                                        :disabled="form.protocol != 'SSH'"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button @click="testConnection">测试连接</el-button>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="文件" name="file" class="tabItem">
                            <el-form label-position="right" label-width="180px">
                                <el-divider content-position="left">高级</el-divider>
                                <el-form-item label="超时：">
                                    <el-input v-model="form.timeout" placeholder="请输入超时时间"></el-input>
                                </el-form-item>
                                <el-form-item label="使用活动的FTP连接：">
                                    <el-checkbox v-model="form.activeConnection"></el-checkbox>
                                </el-form-item>
                                <el-divider content-position="left">远程</el-divider>
                                <el-form-item label="从上一步结果复制参数：">
                                    <el-checkbox v-model="form.copyprevious"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="远程目录：" >
                                    <div style="display: flex;">
                                        <el-input v-model="form.ftpdirectory" :disabled="form.copyprevious" placeholder="请输入远程目录"
                                            style="width: 290px;">
                                        </el-input>
                                        <el-button @click="testDirectory" style="margin-left: 10px;" :disabled="form.copyprevious">测试目录</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="通配符（正则表达式）：">
                                    <el-input v-model="form.wildcard" :disabled="form.copyprevious" placeholder="请输入通配符"></el-input>
                                </el-form-item>
                                <el-divider content-position="left">成功条件</el-divider>
                                <el-form-item label="成功条件：">
                                    <el-select v-model="form.success_condition" placeholder="请选择成功条件"
                                        @change="onSuccessConditionChange">
                                        <el-option label="success_when_at_least"
                                            value="success_when_at_least"></el-option>
                                        <el-option label="success_if_errors_less"
                                            value="success_if_errors_less"></el-option>
                                        <el-option label="success_is_all_files_downloaded"
                                            value="success_is_all_files_downloaded"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="数量：" v-if="form.success_condition === 'success_when_at_least'">
                                    <el-input v-model="form.nr_limit_success" placeholder="请输入数量"></el-input>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="Socks代理" name="socks" class="tabItem">
                            <el-form label-position="right" label-width="180px">
                                <el-form-item label="主机：">
                                    <el-input v-model="form.socksproxy_host" placeholder="请输入代理主机"></el-input>
                                </el-form-item>
                                <el-form-item label="端口：">
                                    <el-input v-model="form.socksproxy_port" placeholder="请输入代理端口"></el-input>
                                </el-form-item>
                                <el-form-item label="用户名：">
                                    <el-input v-model="form.socksproxy_username" placeholder="请输入代理用户名"></el-input>
                                </el-form-item>
                                <el-form-item label="密码：">
                                    <el-input v-model="form.socksproxy_password" placeholder="请输入代理密码"></el-input>
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
import { testFtpConnection, testFtpDirectory } from "@/api/kettleApi";
import { ElMessage } from 'element-plus';

const { mxUtils } = window.mx;

// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("general");
const showFileExplorer = ref(false);
const selectedFileType = ref(''); // 记录当前选择的是哪个目录类型

// 初始化表单数据，使用与FTP_DELETE.js一致的字段名
const form = reactive({
    label: "",
    protocol: "",
    serverName: "",
    serverPort: "",
    username: "",
    password: "",
    ftps_connection_type: "",
    useproxy: false,
    proxy_host: "",
    proxy_port: "",
    proxy_username: "",
    proxy_password: "",
    timeout: "",
    activeConnection: false,
    publicpublickey: false,
    keyfilename: "",
    keyfilepass: "",
    wildcard: "",
    ftpdirectory: "",
    copyprevious: false,
    success_condition: "",
    nr_limit_success: "",
    socksproxy_host: "",
    socksproxy_port: "",
    socksproxy_username: "",
    socksproxy_password: ""
});

// 计算属性，用于控制界面显示
const isFTPSProtocol = computed(() => form.protocol === 'FTPS');
const isSSHProtocol = computed(() => form.protocol === 'SSH');

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

            // 填充表单字段，使用与FTP_DELETE.js一致的字段名
            form.label = value.getAttribute('label') || '';
            form.protocol = value.getAttribute('protocol') || '';
            form.serverName = value.getAttribute('serverName') || '';
            form.serverPort = value.getAttribute('serverPort') || '';
            form.username = value.getAttribute('username') || '';
            form.password = value.getAttribute('password') || '';
            form.ftps_connection_type = value.getAttribute('ftps_connection_type') || '';
            form.useproxy = value.getAttribute('useproxy') === 'Y';
            form.proxy_host = value.getAttribute('proxy_host') || '';
            form.proxy_port = value.getAttribute('proxy_port') || '';
            form.proxy_username = value.getAttribute('proxy_username') || '';
            form.proxy_password = value.getAttribute('proxy_password') || '';
            form.timeout = value.getAttribute('timeout') || '';
            form.activeConnection = value.getAttribute('activeConnection') === 'Y';
            form.publicpublickey = value.getAttribute('publicpublickey') === 'Y';
            form.keyfilename = value.getAttribute('keyfilename') || '';
            form.keyfilepass = value.getAttribute('keyfilepass') || '';
            form.wildcard = value.getAttribute('wildcard') || '';
            form.ftpdirectory = value.getAttribute('ftpdirectory') || '';
            form.copyprevious = value.getAttribute('copyprevious') === 'Y';
            form.success_condition = value.getAttribute('success_condition') || '';
            form.nr_limit_success = value.getAttribute('nr_limit_success') || '';
            form.socksproxy_host = value.getAttribute('socksproxy_host') || '';
            form.socksproxy_port = value.getAttribute('socksproxy_port') || '';
            form.socksproxy_username = value.getAttribute('socksproxy_username') || '';
            form.socksproxy_password = value.getAttribute('socksproxy_password') || '';
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

            // 更新属性，使用与FTP_DELETE.js一致的字段名
            value.setAttribute("label", form.label);
            value.setAttribute("protocol", form.protocol);
            value.setAttribute("serverName", form.serverName);
            value.setAttribute("serverPort", form.serverPort);
            value.setAttribute("username", form.username);
            value.setAttribute("password", form.password);
            value.setAttribute("ftps_connection_type", form.ftps_connection_type);
            value.setAttribute("useproxy", form.useproxy ? "Y" : "N");
            value.setAttribute("proxy_host", form.proxy_host);
            value.setAttribute("proxy_port", form.proxy_port);
            value.setAttribute("proxy_username", form.proxy_username);
            value.setAttribute("proxy_password", form.proxy_password);
            value.setAttribute("timeout", form.timeout);
            value.setAttribute("activeConnection", form.activeConnection ? "Y" : "N");
            value.setAttribute("publicpublickey", form.publicpublickey ? "Y" : "N");
            value.setAttribute("keyfilename", form.keyfilename);
            value.setAttribute("keyfilepass", form.keyfilepass);
            value.setAttribute("wildcard", form.wildcard);
            value.setAttribute("ftpdirectory", form.ftpdirectory);
            value.setAttribute("copyprevious", form.copyprevious ? "Y" : "N");
            value.setAttribute("success_condition", form.success_condition);
            value.setAttribute("nr_limit_success", form.nr_limit_success);
            value.setAttribute("socksproxy_host", form.socksproxy_host);
            value.setAttribute("socksproxy_port", form.socksproxy_port);
            value.setAttribute("socksproxy_username", form.socksproxy_username);
            value.setAttribute("socksproxy_password", form.socksproxy_password);

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
        console.error('测试失败:', error);
        ElMessage.error('测试失败');
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
        console.error('测试失败:', error);
        ElMessage.error('测试失败');
    }
};

// 成功条件变化时的处理
const onSuccessConditionChange = () => {
    // 当成功条件不是'success_when_at_least'时，清空数量字段
    if (form.success_condition !== 'success_when_at_least') {
        form.nr_limit_success = '';
    }
};

// 监听协议变化
watch(() => form.protocol, (newVal) => {
    // 如果不是FTPS协议，清空连接类型字段
    if (newVal !== 'FTPS') {
        form.ftps_connection_type = '';
    }
});

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