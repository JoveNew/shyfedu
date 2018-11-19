//@ sourceURL=deviceManage.js
DEVICE_MANAGE_URL = "thingMANAGE/deviceManage.ashx";
DEVICE_TABLE_ID = "dataTable";
DEVICE_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColumn();
    BSTable(DEVICE_TABLE_ID, DEVICE_MANAGE_URL, colunms);
    ajaxPost("ashx/getSelectList.ashx", "getAcademyList", academySelectBind);    //动态获取校区下拉框数据，默认第一项为本部
    ajaxPost("ashx/getSelectList.ashx", "getRoomListByAcademy;001", roomSelectBind);    //使用校本部的idx初始化教室select控件的option

    var ability = cookie.get("deviceManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = "";
        temp += '<button type="button" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">新增</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);
    }
});

function initColumn() {
    return [
        { title: 'ID', field: 'device_idx', align: 'center', visible: false,},
        { title: '设备号', field: 'device_code', align: 'center', },
        { title: '设备名', field: 'device_name', align: 'center', },
        { title: '所在位置', field: 'room_code', align: 'center', },
        { title: '所在校区', field: 'academy_name', align: 'center', },
        {
            title: '设备类型', field: 'device_type', align: 'center',
            formatter: function (value, row, index) {
                if (value === "D") {
                    return "普通设备";
                }
                else if (value === "C") {
                    return "耗材";
                }
                else {
                    return "异常设备";
                }
            }
        },
        { title: '设备数量', field: 'device_num', align: 'center', },
        {
            title: '设备状态', field: 'device_state', align: 'center',
            formatter: function (value, row, index) {
                if (value === "U") {
                    return "在用";
                }
                else if (value === "R") {
                    return "维修中";
                }
                else {
                    return "异常状态";
                }
            }
        },
        { title: '创建时间', field: 'device_create', align: 'center', visible: false,},
        { title: '更新时间', field: 'device_update', align: 'center', visible: false,},
        {
            title: '操作', field: 'device_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var ability = cookie.get("deviceManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = "";
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "repair" && row.device_state === "U") {
                        btnStr += '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.device_idx + '\',\'' + "repair" + '\')">报修</button>&nbsp&nbsp';
                    }
                    else if (datas[i] == "update")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.device_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp';
                    else if (datas[i] == "delete")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.device_idx + '\',\'' + "delete" + '\')">删除</button>&nbsp&nbsp';
                }
                return btnStr;
            },
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + DEVICE_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(device_idx, opt) {
    switch (opt) {
        case "detail":
            viewDetails(device_idx);
            break;
        case "edit":
            editDetails(device_idx);
            break;
        case "delete":
            deleteDevice(device_idx);
        case "repair":
            repairDevice(device_idx);
            break;
    }
};

//查看详细
function viewDetails(device_idx) {
    initModal();                               //调出模态框
    var data = "LOAD_INFO;" + device_idx;     //设置ajaxpost请求字符串

    //将tablecontrol.js中的singleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(DEVICE_MANAGE_URL, data, devicesingleDataBind);

    $("#btnSave").css('display', 'none');    //将保存按钮隐去
    setInputEditable(DEVICE_MODAL_ID, true)     //将input设为只读
}

//详情编辑
function editDetails(device_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + device_idx;       //设置ajaxpost请求字符串
    ajaxPost(DEVICE_MANAGE_URL, data, deviceSingleDataBind);
    $("#btnSave").css('display', 'inline');
    setInputEditable(DEVICE_MODAL_ID, false);
}

//删除函数
function deleteDevice(device_idx) {
    var data = "DELETE;" + device_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(DEVICE_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "删除成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(DEVICE_TABLE_ID, DEVICE_MANAGE_URL);
                })
        },
    })
};

//新增数据
function btnInsertOnClick() {
    initModal();     //调出模态框
    $("input").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(DEVICE_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var device_idx = $("#device_idx").val();
    var inputData = getModalVal(DEVICE_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (device_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        submitData = "INSERT;" + inputData;
    }
    else {
        submitData = "UPDATE;" + device_idx + ";" + inputData;
    }
    ajaxPost(DEVICE_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(DEVICE_TABLE_ID,DEVICE_MANAGE_URL);
}
//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(DEVICE_TABLE_ID, DEVICE_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    var resultMessage = result === "0" ? "操作失败" : result;
    bootbox.alert({
        message: resultMessage,
    });
    $("#" + DEVICE_MODAL_ID).modal('hide');      //操作成功后隐藏模态框,主要针对保存成功的情况
    refresh(DEVICE_TABLE_ID, DEVICE_MANAGE_URL);
}

//校区下拉框绑定
function academySelectBind(data) {
    var optionString = "";
    var academys = eval(data);      //将返回的json字符串实例化
    academys.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.academy_code + "'\>" + item.academy_name + "</option>"; //动态添加数据
    })
    $("#academy_code").append(optionString);           // 为模态框中的校区select控件添加数据 
    $("#search_academy_code").append(optionString);     //为搜索框中的校区select控件添加数据
}

//根据所选的校区来动态更新教室select，与校区select的onchange事件绑定
function changeRoomSelectByAcademy(academyId) {
    var academyCode = $("#" + academyId).val();
    ajaxPost("ashx/getSelectList.ashx", "getRoomListByAcademy;" + academyCode, roomSelectBind)
}

//作为回调函数将返回的数据绑定到教室select控件
function roomSelectBind(data) {
    var optionString = "";
    var rooms = eval(data);      //将返回的json字符串实例化
    rooms.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.room_idx + "'\>" + item.room_code + "</option>"; //动态添加数据
    })
    $("#room_idx").empty();        //先清空之前的option
    $("#room_idx").append(optionString);           //为模态框中的教室select控件添加数据 
}
//单条设备信息绑定
function deviceSingleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                  //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {          //若以对象名为id的控件存在，则进行绑定
            if (attriName === "academy_code") {        //若遍历到校区字段，则使用校区字段动态更新教室Select控件
                ajaxPost("ashx/getSelectList.ashx", "getRoomListByAcademy;" + obj[attriName], roomSelectBind,false)   //在此处把异步设置为同步，不然无法正确赋值
            }
            $("#" + attriName).val(obj[attriName]);     //适用于input和以value值绑定的select
        }
    };
};

//设备报修函数
function repairDevice(device_idx) {
    var data = "REPAIR;" + device_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认报修？",
        callback: function (result) {
            if (result == true)
                ajaxPost(DEVICE_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "报修成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(DEVICE_TABLE_ID, DEVICE_MANAGE_URL);
                })
        },
    })
}

