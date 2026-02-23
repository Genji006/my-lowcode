<template>
    <div class="table-config">
        <el-form label-width="100px" label-position="right" inline>
            <el-form-item label="SQL语句" style="width: 96%">
                <el-input v-model="sqlInput" type="textarea" :rows="20" placeholder="" />
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" plain style="width: 100%" :loading="loading" @click="handleParseSql">
                    {{ loading ? '解析中...' : '解析并生成列配置' }}
                </el-button>
            </el-form-item>
            <el-divider content-position="left">外观设置</el-divider>
            <el-form-item label="显示边框">
                <el-switch v-model="activeComp.props.border" />
            </el-form-item>
            <el-form-item label="斑马纹">
                <el-switch v-model="activeComp.props.stripe" />
            </el-form-item>
            <el-form-item label="显示表头">
                <el-switch v-model="activeComp.props.showHeader" />
            </el-form-item>
            <el-form-item label="开启多选">
                <el-switch v-model="activeComp.props.selection" />
            </el-form-item>
            <el-form-item label="表格尺寸">
                <el-radio-group v-model="activeComp.props.size" size="small">
                    <el-radio-button label="large">大</el-radio-button>
                    <el-radio-button label="default">中</el-radio-button>
                    <el-radio-button label="small">小</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-divider content-position="left">分页设置</el-divider>
            <el-form-item label="显示分页">
                <el-switch v-model="activeComp.props.pagination" />
            </el-form-item>
            <el-form-item label="每页条数" v-if="activeComp.props.pagination">
                <el-input-number v-model="activeComp.props.pageSize" :min="1" style="width: 100%" />
            </el-form-item>

            <el-divider content-position="left">列管理</el-divider>
            <div class="column-list">
                <div v-for="(col, index) in activeComp.props.columns" :key="index" class="col-item">
                    <div class="col-header">
                        <span class="col-title">#{{ index + 1 }} {{ col.label }}</span>
                        <div class="col-ops">
                            <el-button link size="small" :disabled="index === 0" @click="moveCol(index, -1)">
                                <el-icon>
                                    <Top />
                                </el-icon>
                            </el-button>
                            <el-button link size="small" :disabled="index === activeComp.props.columns.length - 1"
                                @click="moveCol(index, 1)">
                                <el-icon>
                                    <Bottom />
                                </el-icon>
                            </el-button>
                            <el-button link type="danger" size="small" @click="removeCol(index)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>
                    </div>

                    <div class="col-detail">
                        <div class="detail-row">
                            <el-input v-model="col.label" placeholder="列名" size="small" style="width: 48%" />
                            <el-input v-model="col.prop" placeholder="字段Key" size="small" style="width: 48%" />
                        </div>
                        <div class="detail-row">
                            <el-input v-model="col.width" placeholder="宽度(px)" size="small" style="width: 48%" />
                            <el-select v-model="col.align" placeholder="对齐" size="small" style="width: 48%">
                                <el-option label="左对齐" value="left" />
                                <el-option label="居中" value="center" />
                                <el-option label="右对齐" value="right" />
                            </el-select>
                        </div>
                        <div class="detail-row">
                            <el-checkbox v-model="col.fixed" label="固定列" size="small" />
                        </div>
                    </div>
                </div>

                <el-button type="primary" plain size="small" style="width: 100%; margin-top: 10px" @click="addCol">
                    + 添加列
                </el-button>
            </div>

        </el-form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Top, Bottom, Delete } from '@element-plus/icons-vue';
import { mockApi } from '../../api/mock';

const props = defineProps(['activeComp']);
const sqlInput = ref(`SELECT 
    u.id,
    u.username AS 姓名,
    u.phone_number AS 手机号,
    u.role AS 职位,
    d.dept_name AS 所属部门,
    u.created_at AS 创建时间,
    u.status
FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.id
WHERE u.status = 1;`);
const loading = ref(false);

const addCol = () => {
    props.activeComp.props.columns.push({
        label: '新列',
        prop: 'new_key',
        width: '',
        align: 'left',
        fixed: false
    });
};

const removeCol = (index) => {
    props.activeComp.props.columns.splice(index, 1);
};

const moveCol = (index, step) => {
    const arr = props.activeComp.props.columns;
    const temp = arr[index];
    arr[index] = arr[index + step];
    arr[index + step] = temp;
};

const handleParseSql = async () => {
    const sql = sqlInput.value.trim();
    if (!sql) {
        ElMessage.warning('请输入 SQL 语句');
        return;
    }

    loading.value = true; // 开启 loading

    try {
        // 模拟接口调用
        const res = await mockApi.parseSql({ sql: sqlInput.value });

        if (res.code === 200) {
            const newCols = res.data;
            ElMessageBox.confirm(
                `接口返回成功！解析到 ${newCols.length} 个字段。是否覆盖当前配置？`,
                '解析完成',
                { type: 'success' }
            ).then(() => {
                props.activeComp.props.columns = newCols;
                ElMessage.success('列配置已更新');
            });
        } else {
            ElMessage.error(res.msg || '解析失败');
        }

    } catch (err) {
        ElMessage.error(err.toString());
    } finally {
        loading.value = false; // 关闭 loading
    }
};
</script>

<style scoped>
.column-list {
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
}

.col-item {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.col-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    border-bottom: 1px dashed #eee;
    padding-bottom: 5px;
}

.col-title {
    font-weight: bold;
    font-size: 12px;
    color: #606266;
}

.col-detail {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
}
</style>