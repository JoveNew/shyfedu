SUBJECT_TYPE_MANAGE_URL = "schoolManage/subjectTypeManage.ashx";
SUBJECT_TYPE_TABLE_ID = "dataTable";
SUBJECT_TYPE_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    BSTable(SUBJECT_TYPE_TABLE_ID, SUBJECT_TYPE_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: '编号', field: 'subject_type', align: 'center', },
        { title: '名称', field: 'subject_type_name', align: 'center', },
        {
            title: '状态', field: 'subject_type_delete', align: 'center',
            formatter: function (value, row, index) {
                if (row.subject_type_delete == 'True') {
                    return '<label style="text-align: center; ">停用</label>';
                }
                else if (row.subject_type_delete == 'False') {
                    return '<label style="text-align: center; ">启用</label>';
                }
            }
        },
        { title: '创建时间', field: 'subject_type_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'subject_type_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'subject_type', align: 'center',
            formatter: function (value, row, index)
            {
                var btnStr = "";
                if (row.subject_type_delete == "False") {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnDeleteOnClick(\'' + row.subject_type + '\')" > 停用';
                }
                else {
                    btnStr += '<button type="button" class="btn btn-default  btn-sm" onclick= "btnUnDeleteOnClick(\'' + row.subject_type + '\')" > 启用';
                }
                return btnStr;
            }
        },
    ];
};

//调出模态框
function initModal() {
    $('#' + SUBJECT_TYPE_MODAL_ID).modal({
        keyboard: false
    });
}; 

function btnSearchOnClick() {
    refresh(SUBJECT_TYPE_TABLE_ID, SUBJECT_TYPE_MANAGE_URL);
}

function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(SUBJECT_TYPE_TABLE_ID, SUBJECT_TYPE_MANAGE_URL);
}

//新增数据
function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(SUBJECT_TYPE_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var inputData = getModalVal(SUBJECT_TYPE_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    submitData = "INSERT;" + inputData;
    ajaxPost(SUBJECT_TYPE_MANAGE_URL, submitData, operateSuccess);
};


function btnDeleteOnClick(data) {
    var submitData = "DELETE;" + data;
    ajaxPost(SUBJECT_TYPE_MANAGE_URL, submitData, operateSuccess);
}
function btnUnDeleteOnClick(data) {
    var submitData = "UNDELETE;" + data;
    ajaxPost(SUBJECT_TYPE_MANAGE_URL, submitData, operateSuccess);
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
    $("#" + SUBJECT_TYPE_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(SUBJECT_TYPE_TABLE_ID, SUBJECT_TYPE_MANAGE_URL);
}