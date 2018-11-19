/*
作者：qianqi
创建日期：2018.9.21
文档说明：

*/

PASSWORD_MANAGE_URL = "homePage/changePassword.ashx";
PASSWORD_TABLE_ID = "dataTable";
PASSWORD_MODAL_ID = "DetailModal";
IMG_ARRAY = new Array();
GET_SELECT_LIST = "ashx/getSelectList.ashx";

$(function () {
    
});

function confirmClick() {
    var oldPassword = $("#oldPassword").val();
    var newPassword = $("#newPassword").val();
    var ConfirmNewPassword = $("#ConfirmNewPassword").val();
    var submitData = "";
    if (newPassword == ConfirmNewPassword) {
        submitData = "UPDATE;" + oldPassword + ";" + newPassword;
        ajaxPost(PASSWORD_MANAGE_URL, submitData, operateSuccess);
    }
    else {
        bootbox.alert({
            message: "两次密码输入不一致！",
            size: 'small',
            backdrop: true
        });
        $("input[name='submitData']").val("");
        refresh(PASSWORD_TABLE_ID, PASSWORD_MANAGE_URL);
    }
}

function operateSuccess(result) {
    if (result == "0") {
        bootbox.alert({
            message: "原密码输入错误！",
            size: 'small',
            backdrop: true
        });
    }
    else {
        bootbox.alert({
            message: result,
            size: 'small',
            backdrop: true
        });
        $("#" + PASSWORD_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    }
    $("input[name='submitData']").val("");
    refresh(PASSWORD_TABLE_ID, PASSWORD_MANAGE_URL);
}


function cancelClick() {
    $("input[name='submitData']").val("");
    refresh(PASSWORD_TABLE_ID, PASSWORD_MANAGE_URL);
}