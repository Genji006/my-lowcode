// 导入必要的模块
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

/**
 * 自定义属性提供器模块 - 使用简单的方法
 */
// 最简单的自定义属性提供器实现
const customPropertiesModule = {
  __init__: ['customTabProvider'],
  customTabProvider: ['type', function(eventBus, modeling) {
    // 这里我们不做复杂的事情，只是确保模块能正常加载
    console.log('Custom tab provider loaded');
  }]
};

/**
 * 创建自定义属性组
 */
function createCustomGroup(element, bpmnFactory) {
  // 确保 element 存在
  if (!element) {
    return;
  }

  const group = {
    id: 'customProperties',
    label: '自定义设置',
    entries: []
  };

  // 添加自定义文本字段
  group.entries.push({
    id: 'customText',
    label: '自定义文本',
    html: `
      <div class="bpp-row">
        <label for="custom-text" class="bpp-label">自定义文本</label>
        <div class="bpp-field-wrapper">
          <input
            id="custom-text"
            type="text"
            class="bpp-input"
            data-entry="customText"
          />
        </div>
      </div>
    `,

    get: function(element) {
      const businessObject = getBusinessObject(element);
      return {
        customText: businessObject.customText || ''
      };
    },

    set: function(element, values) {
      const businessObject = getBusinessObject(element);
      return bpmnFactory.updateProperties(businessObject, {
        customText: values.customText
      });
    }
  });

  return group;
}

export default customPropertiesModule;