// 简单的自定义属性定义
export default function(element) {
  // 返回基础的属性配置
  return [
    {
      id: 'customText',
      element: element,
      get: function(element) {
        return {
          customText: element.businessObject.customText || ''
        };
      },
      set: function(element, values) {
        return {
          cmd: 'properties-panel.updateProperties',
          context: {
            element: element,
            properties: {
              customText: values.customText
            }
          }
        };
      },
      label: '自定义文本',
      description: '这是一个自定义文本属性'
    }
  ];
}
