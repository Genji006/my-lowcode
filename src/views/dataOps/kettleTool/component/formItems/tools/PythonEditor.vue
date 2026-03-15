<template>
    <div class="studio-container" :class="themeClass" :style="{ height: height }">
        <div class="ambient-glow"></div>

        <header class="command-bar">
            <div class="bar-left">
                <div class="brand">
                    <div class="logo-box">
                        <el-icon>
                            <Platform />
                        </el-icon>
                    </div>
                    <span class="brand-name">Python Editor</span>
                </div>

                <div class="status-pill" :class="statusClass">
                    <div class="status-dot"></div>
                    <span>{{ statusText }}</span>
                </div>
            </div>

            <div class="bar-right">
                <div class="tool-group">
                    <el-dropdown trigger="click" @command="installPackage" :disabled="!isReady">
                        <button class="icon-btn glass" title="安装依赖">
                            <el-icon>
                                <Box />
                            </el-icon>
                        </button>
                        <template #dropdown>
                            <el-dropdown-menu class="modern-dropdown">
                                <el-dropdown-item command="numpy">Numpy</el-dropdown-item>
                                <el-dropdown-item command="pandas">Pandas</el-dropdown-item>
                                <el-dropdown-item command="matplotlib">Matplotlib</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <button class="icon-btn glass" @click="toggleTheme" title="切换主题">
                        <el-icon v-if="isDarkMode">
                            <Moon />
                        </el-icon>
                        <el-icon v-else>
                            <Sunny />
                        </el-icon>
                    </button>

                    <div class="divider"></div>

                    <button class="action-btn primary" @click="runCode" :disabled="!isReady || isRunning">
                        <el-icon v-if="!isRunning">
                            <VideoPlay />
                        </el-icon>
                        <el-icon v-else class="is-loading">
                            <Loading />
                        </el-icon>
                        <span>{{ isRunning ? 'Running...' : '运行' }}</span>
                    </button>

                    <el-tooltip content="重置内核" :show-after="500">
                        <button class="icon-btn glass danger-hover" @click="resetKernel" :disabled="!isReady">
                            <el-icon>
                                <RefreshRight />
                            </el-icon>
                        </button>
                    </el-tooltip>

                    <el-tooltip content="清空日志" :show-after="500">
                        <button class="icon-btn glass" @click="clearConsole">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </button>
                    </el-tooltip>
                </div>
            </div>
        </header>

        <div class="workspace">
            <splitpanes class="default-theme modern-split" :horizontal="isMobile" style="height: 100%">

                <pane min-size="20" :size="60" class="flex-pane">
                    <div class="editor-wrapper">
                        <codemirror v-model="code" class="cm-modern" :autofocus="true" :indent-with-tab="true"
                            :tab-size="4" :extensions="extensions" />
                    </div>
                </pane>

                <pane min-size="20" :size="40" class="flex-pane">
                    <div class="output-panel">
                        <div class="panel-tabs">
                            <div class="tab-item" :class="{ active: activeTab === 'terminal' }"
                                @click="activeTab = 'terminal'">
                                <el-icon>
                                    <Monitor />
                                </el-icon> 控制台
                            </div>
                            <div class="tab-item" :class="{ active: activeTab === 'plots' }"
                                @click="activeTab = 'plots'">
                                <el-icon>
                                    <Picture />
                                </el-icon> 图表
                                <span class="dot-badge" v-show="hasNewPlot"></span>
                            </div>
                        </div>

                        <div class="panel-content">
                            <div v-show="activeTab === 'terminal'" class="view-container scrollable" ref="consoleRef">
                                <div v-for="(log, i) in logs" :key="i" :class="['log-row', log.type]">
                                    <span class="line-num">{{ i + 1 }}</span>
                                    <span class="log-text">{{ log.msg }}</span>
                                </div>
                                <div v-if="logs.length === 0 && isReady" class="empty-placeholder">
                                    <el-icon :size="32" style="margin-bottom:10px; opacity:0.5">
                                        <Monitor />
                                    </el-icon>
                                    <span>准备就绪</span>
                                    <span class="sub-text">Ready to run Python 3.11</span>
                                </div>
                            </div>

                            <div v-show="activeTab === 'plots'" class="view-container scrollable center-content"
                                id="plot-target">
                                <div v-if="!hasPlotContent" class="empty-placeholder">
                                    <el-icon :size="40" style="opacity: 0.5">
                                        <DataLine />
                                    </el-icon>
                                    <span style="margin-top: 10px">暂无图表</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </pane>
            </splitpanes>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, defineProps, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { Codemirror } from 'vue-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark' // 暗黑主题
import { autocompletion } from '@codemirror/autocomplete'
import { Platform, VideoPlay, Delete, Box, Monitor, Picture, RefreshRight, DataLine, Loading, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    height: { type: String, default: '600px' }
})

// --- 状态 ---
const isMobile = ref(false)
const isDarkMode = ref(true) // 默认为暗黑模式
const code = ref(`import matplotlib.pyplot as plt
import numpy as np

# --- 1. 数据准备 ---
# 使用 numpy 在 0 到 4π (约 12.56) 之间生成 200 个均匀分布的点
x = np.linspace(0, 4 * np.pi, 200)

# 计算对应的正弦值和余弦值，并稍微放大振幅
y_sin = np.sin(x) * 1.5
y_cos = np.cos(x) * 1.5

# --- 2. 开始绘图 ---
# 创建一个新的图形界面，设置大小为 宽8英寸, 高5英寸
plt.figure(figsize=(8, 5))

# 绘制正弦曲线：使用蓝色(blue)，线宽为2，标签为 'Sine Wave'
plt.plot(x, y_sin, label='Sine Wave (sin)', color='#1f77b4', linewidth=2)

# 绘制余弦曲线：使用橙色(orange)，虚线样式(--)，标签为 'Cosine Wave'
plt.plot(x, y_cos, label='Cosine Wave (cos)', color='#ff7f0e', linestyle='--', linewidth=2, alpha=0.8)

# --- 3. 添加图表装饰 ---
# 添加标题，设置字体大小和粗细
plt.title('Python Matplotlib Demo: Sine & Cosine Waves', fontsize=14, fontweight='bold', pad=15)

# 添加 X 轴和 Y 轴的标签
plt.xlabel('X Axis (Radians)', fontsize=12)
plt.ylabel('Y Axis (Amplitude)', fontsize=12)

# 添加图例 (它会自动读取上面 plt.plot 中的 label 参数)
plt.legend(loc='upper right', frameon=True, shadow=True)

# 添加网格线，使其看起来更专业，alpha 控制透明度
plt.grid(True, linestyle=':', alpha=0.6)

# 在 y=0 处添加一条水平参考线
plt.axhline(y=0, color='black', linewidth=0.8)

# --- 4. 显示图表 ---
# 在 Pyodide 环境中，这行代码会触发浏览器渲染图片
print("Generating plot... Check the plot area!")
plt.show()`)

const logs = ref([])
const activeTab = ref('terminal')
const isReady = ref(false)
const isRunning = ref(false)
const hasNewPlot = ref(false)
const hasPlotContent = ref(false)
const consoleRef = ref(null)
const statusText = ref('Initializing...')
let pyodide = null

// --- 计算属性 ---
const themeClass = computed(() => isDarkMode.value ? 'theme-dark' : 'theme-light')

// 动态切换 CodeMirror 主题
const extensions = computed(() => {
    const exts = [python(), autocompletion()]
    if (isDarkMode.value) {
        exts.push(oneDark) // 只有暗黑模式加载 OneDark
    }
    return exts
})

const statusClass = computed(() => {
    if (isRunning.value) return 'busy'
    if (isReady.value) return 'ready'
    return 'loading'
})

// --- 绘图配置生成器 (根据主题返回不同配色) ---
const getPlotSetupScript = (isDark) => {
    // 定义颜色变量
    const textColor = isDark ? '#c0c4cc' : '#606266'
    const titleColor = isDark ? 'white' : '#303133'
    const spineColor = isDark ? '#4c4d4f' : '#dcdfe6'

    return `
import matplotlib.pyplot as plt
import io, base64
from js import document

def custom_show():
    fig = plt.gcf()
    # 背景透明，让 CSS 决定底色
    fig.patch.set_alpha(0)
    ax = fig.gca()
    ax.patch.set_alpha(0)
    
    # 动态配色
    TEXT_COLOR = '${textColor}'
    ax.tick_params(colors=TEXT_COLOR)
    ax.xaxis.label.set_color(TEXT_COLOR)
    ax.yaxis.label.set_color(TEXT_COLOR)
    ax.title.set_color('${titleColor}')
    for spine in ax.spines.values():
        spine.set_edgecolor('${spineColor}')

    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120, facecolor=fig.get_facecolor())
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    
    target = document.getElementById("plot-target")
    if target:
        target.innerHTML = ""
        img = document.createElement("img")
        img.src = "data:image/png;base64," + img_str
        img.className = "plot-anim"
        target.appendChild(img)
    plt.clf()

plt.show = custom_show
`
}

// --- 核心逻辑 ---
const initPyodide = async () => {
    try {
        pushLog('system', '正在初始化环境...')
        if (!window.loadPyodide) {
            const script = document.createElement('script')
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
            document.head.appendChild(script)
            await new Promise(r => script.onload = r)
        }

        pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" })

        statusText.value = '加载依赖...'
        await pyodide.loadPackage(["micropip", "numpy", "matplotlib"])

        // 初始化时应用当前主题的绘图配置
        await pyodide.runPythonAsync(getPlotSetupScript(isDarkMode.value))

        pyodide.setStdout({ batched: (msg) => pushLog('output', msg) })

        pushLog('success', '环境初始化完成')
        isReady.value = true
        statusText.value = '就绪'
    } catch (e) {
        statusText.value = '错误'
        pushLog('error', e.message)
    }
}

const runCode = async () => {
    if (!pyodide) return
    isRunning.value = true
    hasNewPlot.value = false
    if (activeTab.value !== 'plots') activeTab.value = 'terminal'

    try {
        // 运行前确保绘图配置是最新的
        await pyodide.runPythonAsync(getPlotSetupScript(isDarkMode.value))
        await pyodide.loadPackagesFromImports(code.value)
        await pyodide.runPythonAsync(code.value)
        if (document.getElementById("plot-target")?.querySelector('img')) {
            hasPlotContent.value = true
            hasNewPlot.value = true
        }
    } catch (err) { pushLog('error', err.toString()) }
    finally { isRunning.value = false }
}

const resetKernel = async () => {
    logs.value = []; hasPlotContent.value = false;
    document.getElementById("plot-target").innerHTML = ""
    try {
        statusText.value = '重置中...'
        await pyodide.runPythonAsync(`globals().clear()`)
        await pyodide.runPythonAsync(`import __main__; import micropip; import numpy; import matplotlib.pyplot as plt`)
        await pyodide.runPythonAsync(getPlotSetupScript(isDarkMode.value))
        pushLog('success', '内核已重置')
        ElMessage.success('重置成功')
    } catch (e) { pushLog('error', e.message) }
    finally { statusText.value = '就绪' }
}

const clearConsole = () => logs.value = []
const pushLog = (type, msg) => {
    logs.value.push({ type, msg })
    nextTick(() => { if (consoleRef.value) consoleRef.value.scrollTop = consoleRef.value.scrollHeight })
}
const installPackage = async (cmd) => {
    isRunning.value = true; statusText.value = `Installing...`
    pushLog('system', `正在安装 ${cmd}...`)
    try { await pyodide.runPythonAsync(`import micropip; await micropip.install('${cmd}')`); pushLog('success', `✔ ${cmd} 安装成功`) }
    catch (e) { pushLog('error', e.message) }
    isRunning.value = false; statusText.value = '就绪'
}

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
}

// 监听主题变化，实时更新绘图配置（影响下一次绘图）
watch(isDarkMode, (newVal) => {
    if (isReady.value && pyodide) {
        pyodide.runPythonAsync(getPlotSetupScript(newVal))
    }
})

onMounted(() => {
    initPyodide()
    isMobile.value = window.innerWidth < 768
    window.addEventListener('resize', () => isMobile.value = window.innerWidth < 768)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

/* --- 变量定义：Light & Dark --- */
.theme-dark {
    --bg-app: #141619;
    --bg-panel: #1b1d21;
    --bg-header: #202226;
    --text-main: #e6e8eb;
    --text-dim: #8b9099;
    --border: #2c2e33;
    --scroll-thumb: #333;
    --scroll-track: transparent;
    --glow-color: rgba(64, 158, 255, 0.08);
    --btn-hover: rgba(255, 255, 255, 0.08);
    --tab-hover: rgba(255, 255, 255, 0.02);
    --tab-active-bg: rgba(64, 158, 255, 0.05);
}

.theme-light {
    --bg-app: #f5f7fa;
    --bg-panel: #ffffff;
    --bg-header: #ffffff;
    --text-main: #303133;
    --text-dim: #909399;
    --border: #dcdfe6;
    --scroll-thumb: #c0c4cc;
    --scroll-track: #f5f7fa;
    --glow-color: rgba(64, 158, 255, 0.05);
    --btn-hover: rgba(0, 0, 0, 0.05);
    --tab-hover: rgba(0, 0, 0, 0.02);
    --tab-active-bg: #ecf5ff;
}

.studio-container {
    /* 公共变量 */
    --primary: #409eff;
    --primary-hover: #66b1ff;
    --radius: 8px;
    --success: #67c23a;
    --warning: #e6a23c;
    --danger: #f56c6c;

    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: var(--bg-app);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    /* 阴影调淡 */
    font-family: 'Inter', sans-serif;
    color: var(--text-main);
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

/* 氛围光 */
.ambient-glow {
    position: absolute;
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(circle, var(--glow-color) 0%, rgba(0, 0, 0, 0) 70%);
    pointer-events: none;
    z-index: 1;
}

/* Header */
.command-bar {
    height: 48px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    z-index: 10;
    transition: background-color 0.3s;
}

.bar-left,
.bar-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 14px;
}

.logo-box {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary) 0%, #337ecc 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
}

.status-pill {
    font-size: 12px;
    color: var(--text-dim);
    background: var(--tab-hover);
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #909399;
}

.status-pill.ready .status-dot {
    background: var(--success);
    box-shadow: 0 0 5px var(--success);
}

.status-pill.busy .status-dot {
    background: var(--warning);
}

/* Buttons */
.tool-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.divider {
    width: 1px;
    height: 18px;
    background: var(--border);
    margin: 0 4px;
}

.icon-btn {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    color: var(--text-main);
    background: transparent;
    transition: all 0.2s;
}

.icon-btn.glass:hover {
    background: var(--btn-hover);
}

.icon-btn.glass.danger-hover:hover {
    background: rgba(245, 108, 108, 0.15);
    color: var(--danger);
}

.icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.action-btn {
    height: 30px;
    padding: 0 14px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: #fff;
}

.action-btn:hover:not(:disabled) {
    background: var(--primary-hover);
}

.action-btn:disabled {
    background: #555;
    opacity: 0.5;
    cursor: not-allowed;
}

/* Workspace */
.workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    z-index: 5;
}

.flex-pane {
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden;
}

:deep(.splitpanes__splitter) {
    background: var(--bg-app);
    border-left: 1px solid var(--border);
    width: 1px !important;
    position: relative;
    transition: background 0.2s;
}

:deep(.splitpanes__splitter:hover) {
    background: var(--primary);
    width: 2px !important;
}

/* Editor */
.editor-wrapper {
    flex: 1;
    height: 100%;
    background: var(--bg-panel);
    overflow: hidden;
}

.cm-modern {
    height: 100% !important;
    font-size: 14px;
}

:deep(.cm-editor) {
    height: 100%;
    background-color: var(--bg-panel);
    color: var(--text-main);
}

:deep(.cm-gutters) {
    background-color: var(--bg-panel);
    border-right: 1px solid var(--border);
    color: var(--text-dim);
}

/* Output Panel */
.output-panel {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-panel);
    border-left: 1px solid var(--border);
}

.panel-tabs {
    height: 36px;
    display: flex;
    border-bottom: 1px solid var(--border);
    background: var(--bg-header);
    flex-shrink: 0;
}

.tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab-item:hover {
    color: var(--text-main);
    background: var(--tab-hover);
}

.tab-item.active {
    color: var(--text-main);
    border-bottom-color: var(--primary);
    background: var(--tab-active-bg);
}

.dot-badge {
    width: 6px;
    height: 6px;
    background: var(--primary);
    border-radius: 50%;
}

.panel-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
}

.view-container {
    flex: 1;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
}

.scrollable {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
}

.center-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* Logs */
.log-row {
    display: flex;
    gap: 10px;
    margin-bottom: 2px;
}

.line-num {
    color: var(--text-dim);
    width: 24px;
    text-align: right;
    font-size: 12px;
    flex-shrink: 0;
}

.log-text {
    color: var(--text-main);
    white-space: pre-wrap;
    word-break: break-all;
}

.log-row.system .log-text {
    color: var(--primary);
    font-style: italic;
    opacity: 0.8;
}

.log-row.error .log-text {
    color: var(--danger);
}

.log-row.success .log-text {
    color: var(--success);
}

.log-row.output .log-text {
    color: var(--text-main);
}

:deep(.plot-anim) {
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    border: 1px solid var(--border);
}

.empty-placeholder {
    color: var(--text-dim);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: var(--scroll-track);
}

::-webkit-scrollbar-thumb {
    background: var(--scroll-thumb);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #888;
}
</style>