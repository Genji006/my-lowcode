/**
 * 重新构建树形数组，当code值中包含"-"时，去除当前对象但保留其子级
 * @param {Array} tree 原始树形数组
 * @returns {Array} 重构后的树形数组
 */
export function restructureTree(data) {
    let tree = JSON.parse(JSON.stringify(data));
    // 边界检查
    if (!Array.isArray(tree)) {
        return [];
    }
    let result = [];
    for (let item of tree) {
        if (item.code && item.code.includes("-")) {
            // 如果当前项的code包含"-"，则跳过该项，只保留其子级
            if (item.children && item.children.length > 0) {
                // 递归处理子级，并将处理后的子级添加到结果中
                // 注意：需要更新子级的fatherCode为当前项的fatherCode
                const processedChildren = restructureTree(item.children).map(
                    (child) => {
                        return {
                            ...child,
                            fatherCode: item.fatherCode,
                        };
                    }
                );
                result.push(...processedChildren);
            }
        } else {
            // 如果当前项的code不包含"-"，则保留该项
            let newItem = { ...item };
            // 递归处理子级
            if (item.children && item.children.length > 0) {
                newItem.children = restructureTree(item.children);
            }
            result.push(newItem);
        }
    }
    return result;
}


export function findObjectByUniqueCode(uniqueCode, data = lazyData.value) {
    let arrData = JSON.parse(JSON.stringify(data));
    // 确保data是数组
    if (!Array.isArray(arrData)) {
        return null;
    }
    // 遍历当前层级的所有对象
    for (const item of arrData) {
        // 如果当前对象的uniqueCode匹配，直接返回
        if (item && item.uniqueCode === uniqueCode) {
            return item;
        }
        // 如果当前对象有子节点，递归搜索子节点
        if (
            item &&
            item.children &&
            Array.isArray(item.children) &&
            item.children.length > 0
        ) {
            const foundInChildren = findObjectByUniqueCode(uniqueCode, item.children);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    // 未找到匹配的对象
    return null;
}


export const selectDataValueFn = (dataSelect, arr = []) => {
    dataSelect.forEach((item) => {
        if (item.children && item.children.length > 0) {
            if (item.checked) {
                arr.push(item);
            }
            selectDataValueFn(item.children, arr);
        } else {
            if (item.checked) {
                arr.push(item);
            }
        }
    });
    return arr;
};


export const childrenCheckedFn = (data, arr = []) => {
  for (let i = 0, len = data.length; i < len; i++) {
    if (data[i].children && data[i].children.length > 0) {
      arr.push(data[i].uniqueCode);
      childrenCheckedFn(data[i].children, arr);
    } else {
      arr.push(data[i].uniqueCode);
    }
  }
  return arr;
};