
//  密码校验规则
export function createPasswordPattern() {
    return new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*+\-./:;<=>?\\^_`{|}~]).{8,16}$/)
}
