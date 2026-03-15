// 基础的自定义属性提供者
import spellProps from './SpellProps';

const LOW_PRIORITY = 500;

export default function MagicPropertiesProvider(propertiesPanel, translate) {
  // 实现getGroups方法（适用于较旧版本API）
  this.getGroups = function(element) {
    // 返回一个组，包含我们的自定义属性
    return [
      {
        id: 'magicGroup',
        label: '自定义属性',
        entries: spellProps(element)
      }
    ];
  };

  // 同时实现getTabs方法（适用于较新版本API）
  this.getTabs = function(element) {
    return function(tabs) {
      // 创建一个新的标签页
      tabs.push({
        id: 'magicTab',
        label: '自定义属性',
        groups: function(element) {
          return [
            {
              id: 'magicGroup',
              label: '自定义属性',
              entries: spellProps(element)
            }
          ];
        },
        show: true
      });
      return tabs;
    };
  };

  // 注册provider
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

MagicPropertiesProvider.$inject = ['propertiesPanel', 'translate'];