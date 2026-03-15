//  组件类型
export function fieldTypesList(data) {
    let arr = [
        { value: 'el-input', label: '文本输入' },
        { value: 'el-select', label: '下拉选择' },
        { value: 'el-select-v2', label: '虚拟下拉框' },
        { value: 'el-date-picker', label: '时间范围选择' },
        { value: 'el-radio-date', label: '时间选择组件' },
    ]
    if (data) {
        return arr.find(item => item.value == data)?.label || ''
    } else {
        return arr
    }
}
//  查询方式
export function fieldQueryType(data) {
    let arr = [
        { value: 'like', label: '模糊查询' },
        { value: 'eq', label: '精准查询' },
        { value: 'dateRange', label: '时间范围' },
    ]
    if (data) {
        return arr.find(item => item.value == data)?.label || ''
    } else {
        return arr
    }
}
//  数据类型(下拉框)
export function optionSource(data) {
    let arr = [
        { value: '字典', label: '字典' },
        { value: '接口', label: '接口' },
        { value: '自定义', label: '自定义' },
    ]
    if (data) {
        return arr.find(item => item.value == data)?.label || ''
    } else {
        return arr
    }
}
//  时间范围
export function datePickerTypeList() {
    return [
        { value: 'year', label: '年' },
        { value: 'quarter', label: '季' },
        { value: 'month', label: '月' },
        { value: 'date', label: '日' },
        { value: 'yearrange', label: '年(范围)' },
        { value: 'quarterrange', label: '季(范围)' },
        { value: 'monthrange', label: '月(范围)' },
        { value: 'daterange', label: '日(范围)' },
    ]
}

//  默认值
export function defaultList() {
    return [
        { value: 'year', label: '年' },
        { value: 'quarter', label: '季' },
        { value: 'months', label: '月' },
    ]
}
export function defaultListCopy() {
    return [
        { value: 'year', label: '年' },
        { value: 'quarter', label: '季' },
        { value: 'months', label: '月' },
         { value: 'date', label: '日' },
    ]
}
export function fieldValidate() {
    return [
        { value: 'phone', label: '手机号码', pattern: /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/, message: '请输入有效的手机号码', trigger: 'blur' },
        { value: 'url', label: 'URL', pattern: /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, message: '请输入有效的URL', trigger: 'blur' },
        { value: 'number', label: '数字', pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' },
        { value: 'integer', label: '整数', pattern: /^-?\d+$/, message: '请输入有效的整数', trigger: 'blur' },
        { value: 'float', label: '浮点数', pattern: /^-?\d+(\.\d+)?$/, message: '请输入有效的浮点数', trigger: 'blur' },
        { value: 'email', label: '邮箱', pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入有效的邮箱', trigger: 'blur' },
        { value: 'idcard', label: '身份证', pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入有效的身份证号', trigger: 'blur' },
    ]
}
