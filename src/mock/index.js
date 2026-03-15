import Mock from 'mockjs'
// 典型数据生成示例

// 带层级的树形结构 mock 示例
Mock.mock('/mock/treeData', 'post', {
  'ItemMsg': {
    projectId: '@guid', // 所属项目
    tableName: '@word(8,16)', // 表英文名
    tableShowName: '@ctitle(4,10)表', // 表中文名
    remark: '@cword(8,20)', // 表备注
    SqlScript: 'CREATE TABLE ...;' // 建表用脚本
  },
  'list|3-5': [
    {
      id: '@guid',
      en_tableName: '@word(6,16)', // 字段英文名
      cn_tableName: '@ctitle(3,8)表', // 字段中文名
      fieldType: '@pick(["String","Int","Number","Long","Boolean","Date","DateTime","Text","Double","Decimal","Binary","JSON"])', // 字段类型
      fieldLength: '@natural(10,255)', // 字段长度
      fieldKey: '@pick(["0","1"])', // 主键 0否 1是
      fieldNull: '@pick(["0","1"])', // 字段非空 0否 1是
      fieldKyf: '@pick(["0","1"])', // 字段启用否 0否 1是
      fieldDescribe: '@cword(0,10)' // 字段说明
    }
  ]
})