//  正则校验只允许输入指定数字

export function regexpFn(event, value, type) {
  //  只允许输入数字
  if (type === "num") {
    value = event.replace(/[^\d.]/g, "");
  }
}
