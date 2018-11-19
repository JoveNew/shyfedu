//@ sourceURL=deviceRepairManage.js
DEVICE_REPAIR_MANAGE_URL = "thingMANAGE/deviceRepairManage.ashx";
DEVICE_REPAIR_TABLE_ID = "dataTable";

$(function () {
    var colunms = initColumn();
    BSTable(DEVICE_REPAIR_TABLE_ID, DEVICE_REPAIR_MANAGE_URL, colunms);
    ajaxPost("ashx/getSelectList.ashx", "getAcademyList", academySelectBind);    //动态获取校区下拉框数据，默认第一项为本部
});

function initColumn() {
    return [
        { title: 'ID', field: 'device_repair_idx', align: 'center', visible: false,},
        { title: '设备号', field: 'device_code', align: 'center', },
        { title: '设备名', field: 'device_name', align: 'center', },
        { title: '所在教室', field: 'room_name', align: 'center', },
        { title: '报修时间', field: 'device_create', align: 'center', },
        {
            title: '维修状态', field: 'repair_state', align: 'center',
            formatter: function (value, row, index) {
                return value == "1" ? "维修完成" : "维修中";
            }
        },
        { title: '更新时间', field: 'device_update', align: 'center', },
        {
            title: '操作', field: 'device_repair_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                if (row.repair_state != "1") {
                    return '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.device_idx + '\',\'' + "complete" + '\')">维修完成</button>';
                }
            }
        }
    ];
};

//操作列三个按键的点击函数
function optBtnOnClick(device_idx, opt) {
    switch (opt) {
        case "complete":
            repairComplete(device_idx);
            break;
    }
};

//维修完成函数
function repairComplete(device_idx) {
    var data = "COMPLETE;" + device_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认维修是否完成？",
        callback: function (result) {
            if (result == true)
                ajaxPost(DEVICE_REPAIR_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "维修成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(DEVICE_REPAIR_TABLE_ID, DEVICE_REPAIR_MANAGE_URL);
                })
        },
    })
}

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(DEVICE_REPAIR_TABLE_ID, DEVICE_REPAIR_MANAGE_URL);
}
//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(DEVICE_REPAIR_TABLE_ID, DEVICE_REPAIR_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    var resultMessage = result === "0" ? "操作失败" : result;
    bootbox.alert({
        message: resultMessage,
    });
    $("#" + DEVICE_REPAIR_MODAL_ID).modal('hide');      //操作成功后隐藏模态框,主要针对保存成功的情况
    refresh(DEVICE_REPAIR_TABLE_ID, DEVICE_REPAIR_MANAGE_URL);
}

//校区下拉框绑定
function academySelectBind(data) {
    var optionString = "";
    var academys = eval(data);      //将返回的json字符串实例化
    academys.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.academy_code + "'\>" + item.academy_name + "</option>"; //动态添加数据
    })
    $("#search_academy_code").append(optionString);     //为搜索框中的校区select控件添加数据
}



