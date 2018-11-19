﻿//@ sourceURL=academyManage.js
ACADEMY_MANAGE_URL = "schoolManage/academyManage.ashx";
ACADEMY_TABLE_ID = "dataTable";
ACADEMY_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    BSTable(ACADEMY_TABLE_ID, ACADEMY_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: '校区编号', field: 'academy_code', align: 'center', },
        { title: '校区名称', field: 'academy_name', align: 'center', },
        {
            title: '状态', field: 'academy_delete', align: 'center',
            formatter: function (value, row, index) {
                if (row.academy_delete == 'True') {
                    return '<label style="text-align: center; ">停用</label>';
                }
                else if (row.academy_delete == 'False') {
                    return '<label style="text-align: center; ">启用</label>';
                }
            }
        },
        { title: '创建时间', field: 'academy_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'academy_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'academy_code', align: 'center',
            formatter: function (value, row, index) {
                var btnStr = '<button type="button" class="btn btn-default  btn-sm" onclick= "btnEditOnclick(\'' + row.academy_code + '\')" > 编辑';
                if (row.academy_delete == "False") {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnDeleteOnClick(\'' + row.academy_code + '\')" > 停用';
                }
                else {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnUnDeleteOnClick(\'' + row.academy_code + '\')" > 启用';
                }
                return btnStr;
            }
        },
    ];
};

//调出模态框
function initModal() {
    $('#' + ACADEMY_MODAL_ID).modal({
        keyboard: false
    });
}; 

function btnSearchOnClick() {
    refresh(ACADEMY_TABLE_ID, ACADEMY_MANAGE_URL);
}

function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(ACADEMY_TABLE_ID, ACADEMY_MANAGE_URL);
}

function btnEditOnclick(data) {
    initModal();
    var submitData = "LOAD_INFO;" + data;
    $("#form_code").val(data);
    ajaxPost(ACADEMY_MANAGE_URL, submitData, singleDataBind);
}

function btnDeleteOnClick(data) {
    var submitData = "DELETE;" + data;
    ajaxPost(ACADEMY_MANAGE_URL, submitData, operateSuccess);
}

function btnUnDeleteOnClick(data) {
    var submitData = "UNDELETE;" + data;
    ajaxPost(ACADEMY_MANAGE_URL, submitData, operateSuccess);
}

function operateSuccess(result) {
    bootbox.setDefaults({   //为bootbox.alert增加默认样式
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
    var operateResult = result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: operateResult
    });
    refresh(ACADEMY_TABLE_ID, ACADEMY_MANAGE_URL);
    $("#" + ACADEMY_MODAL_ID).modal("hide");
}

function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input").val("");
}

function btnSaveOnClick() {
    var inputData = getModalVal(ACADEMY_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    var academyCode = $("#form_code").val();
    if (academyCode == '') {
        submitData = "INSERT;" + inputData;
    }
    else
        submitData = "UPDATE;" + academyCode + ";" + inputData;
    ajaxPost(ACADEMY_MANAGE_URL, submitData, operateSuccess);
};
