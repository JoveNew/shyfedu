MAJOR_MANAGE_URL = "schoolManage/majorManage.ashx";
MAJOR_TABLE_ID = "dataTable";
MAJOR_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    BSTable(MAJOR_TABLE_ID, MAJOR_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: '专业编号', field: 'major_code', align: 'center', },
        { title: '专业名称', field: 'major_name', align: 'center', },
        {
            title: '状态', field: 'major_delete', align: 'center',
            formatter: function (value, row, index) {
                if (row.major_delete == 'True') {
                    return '<label style="text-align: center; ">停用</label>';
                }
                else if (row.major_delete == 'False') {
                    return '<label style="text-align: center; ">启用</label>';
                }
            }
        },
        { title: '创建时间', field: 'major_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'major_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'major_code', align: 'center',
            formatter: function (value, row, index) {
                var btnStr = '<button type="button" class="btn btn-default  btn-sm" onclick= "gotoMajorTrainOnClick(\'' + row.major_code + '\',\''+row.major_name+'\')" > 教学进程表';
                btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnEditOnclick(\'' + row.major_code + '\')" > 编辑';
                if (row.major_delete == "False") {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnDeleteOnClick(\'' + row.major_code + '\')" > 停用';
                }
                else {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnUnDeleteOnClick(\'' + row.major_code + '\')" > 启用';
                }
                return btnStr;
            }
        },
    ];
};

//调出模态框
function initModal() {
    $('#' + MAJOR_MODAL_ID).modal({
        keyboard: false
    });
}; 

function btnSearchOnClick() {
    refresh(MAJOR_TABLE_ID, MAJOR_MANAGE_URL);
}

function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(MAJOR_TABLE_ID, MAJOR_MANAGE_URL);
}

function btnEditOnclick(data) {
    initModal();
    var submitData = "LOAD_INFO;" + data;
    $("#form_code").val(data);
    ajaxPost(MAJOR_MANAGE_URL, submitData, singleDataBind);
}

function btnDeleteOnClick(data) {
    var submitData = "DELETE;" + data;
    ajaxPost(MAJOR_MANAGE_URL, submitData, operateSuccess);
}

function btnUnDeleteOnClick(data) {
    var submitData = "UNDELETE;" + data;
    ajaxPost(MAJOR_MANAGE_URL, submitData, operateSuccess);
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
    refresh(MAJOR_TABLE_ID, MAJOR_MANAGE_URL);
    $("#" + MAJOR_MODAL_ID).modal("hide");
}

function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input").val("");
}

function btnSaveOnClick() {
    var inputData = getModalVal(MAJOR_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    var majorCode = $("#form_code").val();
    if (majorCode == '') {
        submitData = "INSERT;" + inputData;
    }
    else
        submitData = "UPDATE;" + majorCode + ";" + inputData;
    ajaxPost(MAJOR_MANAGE_URL, submitData, operateSuccess);
};

function gotoMajorTrainOnClick(major_code, major_name) {
    cookie.set("major_code", major_code);
    cookie.set("major_name", major_name);
    cookie.set("path", "schoolManage.majorTrain");
    window.location.href = "../framepage.html";
}