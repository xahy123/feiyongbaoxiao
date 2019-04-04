const data_type = [{
    group: "数值类型",
    types: [{
        type: "smallint",
        describe: "小范围整数, 2字节, -32768到+32767"
    }, {        
        type: "integer",
        describe: "常用的整数, 4字节, -2147483648到+2147483647"
    }, {        
        type: "bigint",
        describe: "大范围的整数, 8字节, -9223372036854775808到9223372036854775807"
    }, {        
        type: "decimal",
        describe: "用户声明精度, 精确, 变长, 无限制"
    }, {        
        type: "numeric",
        describe: "用户声明精度, 精确, 变长, 无限制"
    }, {        
        type: "real",
        describe: "变精度, 不精确, 4字节, 6位十进制数字精度"
    }, {        
        type: "double",
        describe: "变精度, 不精确, 8字节, 15位十进制数字精度"
    }, {        
        type: "serial",
        describe: "自增整数, 4字节, 1到+2147483647"
    }, {        
        type: "bigserial",
        describe: "大范围的自增整数, 8字节, 1到9223372036854775807"
    }]
}, {
    group: "字符类型",
    types: [{
        type: "varchar",
        describe: "变长，有长度限制"
    }, {
        type: "char",
        describe: "定长,不足补空白"
    }, {
        type: "text",
        describe: "变长, 无长度限制"
    }]
}, {
    group: "日期/时间类型",
    types: [{
        type: "timestamp",
        describe: "无时区, 8字节, 包括日期和时间"
    }, {
        type: "timestamptz",
        describe: "含时区, 8字节, 日期和时间带时区"
    }, {
        type: "interval",
        describe: "时间间隔, 12字节"
    }, {
        type: "time",
        describe: "无时区, 8字节, 只用于一日内时间"
    }, {
        type: "timetz",
        describe: "含时区, 8字节, 只用于一日内时间含时区"
    }, {
        type: "date",
        describe: "只用于日期, 4字节"
    }]
}, {
    group: "布尔类型",
    types: [{
        type: "boolean",
        describe: "真(True)或假(False), 1个字节"
    }]
}, {
    group: "数组类型",
    types: [{
        type: "array",
        describe: "数组"
    }]
}, {
    group: "JSON类型",
    types: [{
        type: "json",
        describe: "JSON对象"
    }, {
        type: "jsonb",
        describe: "JSONB对象"
    }]
}, {
    group: "复合类型",
    types: [{
        type: "compound",
        describe: "复合数据类型"
    }]
}]

export default data_type;
