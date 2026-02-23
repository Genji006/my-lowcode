<script>
import { h, defineComponent, resolveComponent } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue'; // 引入所有图标供动态代码使用

export default defineComponent({
    name: 'RuntimeSlot',
    props: {
        // 用户的代码字符串 (例如: "return h('div', 'hello')")
        code: {
            type: String,
            default: ''
        },
        // 传递给代码的上下文数据 (例如: { row, index, model })
        params: {
            type: Object,
            default: () => ({})
        }
    },
    setup(props) {
        // 返回一个渲染函数
        return () => {
            // 1. 如果没有代码，就不渲染
            if (!props.code || !props.code.trim()) {
                return null;
            }

            try {
                // 2. 构造动态函数
                // new Function 的参数列表：
                // arg1: 'h' -> Vue 的渲染函数
                // arg2: 'resolveComponent' -> 用于解析全局组件 (如 'el-button')
                // arg3: 'icons' -> Element Plus 的图标集合
                // arg4: 'params' -> 外部传入的数据
                // arg5: props.code -> 函数体 (用户写的代码)
                const func = new Function(
                    'h',
                    'resolveComponent',
                    'icons',
                    'params',
                    props.code
                );

                // 3. 执行函数并返回 VNode
                // 这里将真实的 Vue 工具函数传进去
                return func(h, resolveComponent, ElementPlusIcons, props.params);

            } catch (err) {
                // 4. 容错处理：如果用户代码写错了，显示红色错误提示，别让整个页面崩掉
                console.error('动态插槽渲染失败:', err);
                return h('div', {
                    style: {
                        color: 'red',
                        fontSize: '12px',
                        border: '1px solid red',
                        padding: '2px 5px',
                        background: '#fff0f0'
                    }
                }, `渲染错误: ${err.message}`);
            }
        };
    }
});
</script>