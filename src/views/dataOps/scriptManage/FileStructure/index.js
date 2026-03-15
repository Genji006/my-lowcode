// 接口请求头
export const headers = {
    Authorization: sessionStorage.getItem("token")
}

// tree 配置
export const defaultProps = {
    children: 'children',
    label: 'scriptName'
};

// 文件命名校验
export const preventInvalidKeys = (event) => {
    const key = event.key;
    const invalidKeys = ['/', ':', '*', '?', '"', '<', '>', '|'];
    if (invalidKeys.includes(key)) {
        event.preventDefault();
    }
};

/**
 * 递归查找指定 ID 的父级对象
 * @param {Array} arr - 要查找的数组
 * @param {string|number} targetId - 目标对象的 ID
 * @returns {Object|null} 找到的父级对象，如果未找到则返回 null
 */
export function findParentById(arr, targetId) {
    if (!arr || !Array.isArray(arr)) return null;
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item.children && item.children.length > 0) {
            const found = item.children.find(child => child.scriptId === targetId);
            if (found) {
                return item;
            }
            const parent = findParentById(item.children, targetId);
            if (parent) {
                return parent;
            }
        }
    }
    return null;
}


// 获取所有id
export const getFileId = (data, arr = []) => {
    data.forEach((item) => {
        arr.push(item.scriptId)
        if (item.children && item.children.length) {
            getFileId(item.children, arr)
        }
    })
    return arr
}