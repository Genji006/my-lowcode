//  图例
export const legendFn = (showLegend, legendPosition, left, right, top, bottom) => {
    const result = { show: showLegend, [legendPosition]: 0, orient: ['left', 'right'].includes(legendPosition) ? 'vertical' : 'horizontal', };
    ['left', 'right', 'top', 'bottom'].forEach(key => {
        if (eval(key) !== undefined && eval(key) !== '') {
            result[key] = eval(key);
        }
    });
     // 当图例垂直排列时（在左侧或右侧），使其在垂直方向上居中
    if (['left', 'right'].includes(legendPosition)) {
        result.top = 'middle';
        result.bottom = 'auto';
    }
    return result;
}


//  网格
export const gridFn = (showGrid, left, right, top, bottom) => {
    return {
        show: showGrid,  //  是否显示网格线
        containLabel: true,   //   标签是否包含在图形中
        left: left,
        right: right,
        top: top,
        bottom: bottom
    }
}

//  工具箱
export const toolbarFn = (showToolbox) => {
    return {
        show: showToolbox,
        feature: {
            saveAsImage: { label: '下载图片', title: '保存图片', },
            dataView: { readOnly: false, title: '数据视图', },
            restore: { title: '还原' },
            dataZoom: { title: '区域缩放' },
            magicType: {
                type: ['line', 'bar'], title: '切换图表类型', option: {
                    line: { title: '折线图' },
                    bar: { title: '柱状图' }
                }
            }
        }
    }
}

//  转化16进制颜色
export function hexToRgb(hex, opacity = 1) {
    // 去掉可能存在的 # 号
    hex = hex.replace(/^#/, '');
    // 检查十六进制字符串的长度
    if (hex.length === 3) {
        // 如果是简写形式（如 #f53），将其扩展为完整形式（如 #ff5533）
        hex = hex.split('').map(char => char + char).join('');
    }
    // 将十六进制字符串转换为RGB值
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b},${opacity})`;
}

//  echart公共接收的对象
export const echartOptions = {
    apiParms: { type: Object, default: () => ({}) }, // API请求参数
    apiUrl: { type: String, default: '/business/design-data/queryChartData' }, // API地
    topConfig: {
        type: Object,
        default: () => ({ title: '', date: '' })
    },
    // 主题
    theme: {
        type: String,
        default: ''
    },
    // 标题
    title: {
        type: String,
        default: ''
    },
    // // 副标
    // subtitle: {
    //     type: String,
    //     default: ''
    // },
    // 是否显示图例
    showLegend: {
        type: Boolean,
        default: true
    },

    // 图例位置
    legendPosition: {
        type: String,
        default: 'top'
    },
    //  图例距离上方
    legendLeft: {
        type: [String, Number],
    },
    //  图例距离右侧
    legendRight: {
        type: [String, Number],
    },
    //  图例距离底部
    legendTop: {
        type: [String, Number],
    },
    //  图例距离左侧
    legendBottom: {
        type: [String, Number],
    },
    // 是否显示工具
    showToolbox: {
        type: Boolean,
        default: true
    },
    // 颜色
    colors: {
        type: Array,
        default: () => ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
    },
    // 是否显示数据标签
    showLabel: {
        type: Boolean,
        default: false
    },
    // 是否显示网格
    showGrid: {
        type: Boolean,
        default: true
    },
    // 网格位置(左)
    gridLeft: {
        type: String,
    },
    // 网格位置(右)
    gridRight: {
        type: String,
    },
    //  网格位置(上)
    gridTop: {
        type: String,
    },
    //  网格位置(下)
    gridBottom: {
        type: String,
    },
    // 是否显示数据标签
    showLabel: {
        type: Boolean,
        default: false
    },
}