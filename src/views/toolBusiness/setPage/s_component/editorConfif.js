

export const editorConfig = {
  language: "javascript", // 编辑器语言
  theme: "vs-dark", // 编辑器主题 默认vs-dark VSCode 黑色主题,可选：vs、vs-dark、hc-black、hc-light
  readOnly: false, // 是否只读内容不可编辑
  codeLens: false, // 代码透镜 - 关闭以提升性能
  folding: true, // 代码折叠
  parameterHints: false, // 参数提示 - 关闭以提升性能
  formatOnType: false, // 输入时格式化 - 关闭以提升性能
  autoClosingBrackets: false, // 自动关闭括号 - 关闭以防止光标跳动
  contextmenu: false, // 右键菜单 - 关闭以提升性能
  acceptSuggestionOnEnter: "off", // 按enter键接受代码提示 - 关闭以防止光标跳动
  selectionHighlight: false, // 选择时高亮 - 关闭以提升性能
  automaticLayout: true, // 自动布局 - 开启以确保编辑器正确适应内容变化
  snippetSuggestions: "none", // 代码提示 - 设置为none以提升性能
  quickSuggestionsDelay: 500, // 代码提示延时 - 增加延时以提升性能
  tabCompletion: "off", // 代码提示按tab完成 - 关闭以提升性能
  scrollBeyondLastLine: false, // 滚动时不允许滚动到最后一行之外 - 优化滚动行为
  renderLineHighlight: "none", // 行高亮 - 关闭以提升性能
  cursorBlinking: "blink", // 光标闪烁方式
  cursorStyle: "line", // 光标样式
  lineNumbers: "on", // 行号
  minimap: {
    enabled: false, // 关闭缩略图
    side: "right",
  },
  scrollbar: {
    verticalScrollbarSize: 8, // 垂直滚动条宽度
    horizontalScrollbarSize: 8, // 水平滚动条高度
    useShadows: false, // 不使用阴影
    verticalHasArrows: false, // 不显示垂直滚动条箭头
    horizontalHasArrows: false, // 不显示水平滚动条箭头
  },
  automaticIndent: "full", // 自动缩进
  wordWrap: "on", // 自动换行
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace", // 字体
  fontSize: 14, // 字体大小
  lineHeight: 1.6, // 行高
  tabSize: 2, // Tab大小
  insertSpaces: true, // 使用空格代替Tab
  bracketPairColorization: {
    enabled: false, // 关闭括号对颜色化 - 提升性能
  },
  suggestOnTriggerCharacters: false, // 不基于触发字符显示建议
  quickSuggestions: {
    other: false,
    comments: false,
    strings: false,
  },
  autoIndentOnPaste: false, // 粘贴时不自动缩进
  suggestFontSize: 14, // 建议字体大小
  suggestLineHeight: 1.6, // 建议行高
  suggestSelection: "first", // 建议选择行为
  wordBasedSuggestions: false, // 不基于单词显示建议
  lineDecorationsWidth: 10, // 行装饰宽度
  lineNumbersMinChars: 3, // 行号最小字符数
  scrollBeyondLastColumn: 10, // 滚动时允许滚动到最后一列之外的字符数
  wordWrapColumn: 100, // 自动换行列号
  wordWrapMinified: true, // 对压缩代码启用自动换行
  wrappingIndent: "indent", // 换行缩进方式
};



