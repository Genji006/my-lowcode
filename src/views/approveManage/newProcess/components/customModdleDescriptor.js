// 自定义模型描述
const customModdleDescriptor = {
  name: 'custom',
  uri: 'http://custom',
  prefix: 'custom',
  types: [
    {
      name: 'CustomExtension',
      superClass: ['bpmn:BaseElement'],
      properties: [
        {
          name: 'customText',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'customStatus',
          isAttr: true,
          type: 'String'
        }
      ]
    }
  ]
};

export default customModdleDescriptor;