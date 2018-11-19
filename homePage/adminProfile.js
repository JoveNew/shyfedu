/*
作者：qianqi
创建日期：2018.9.21
文档说明：
*/
//@ sourceURL = adminProfile.js
FRAME_PAGE_URL = "../framePage.ashx";
PROFILE_MANAGE_URL = "homePage/adminProfile.ashx";
PROFILE_TABLE_ID = "dataTable";
PROFILE_PANEL_ID = "DetailPanel";
CANVAS_ID = "image_can";
IMG_ARRAY = new Array();
GET_SELECT_LIST = "ashx/getSelectList.ashx";

$(function () {
    ajaxPost(FRAME_PAGE_URL, "getAccount", setAccount);
});

function setAccount(result) {
    var account = JSON.parse(result);
    cookie.set("account_idx", account.account_idx);
    if (account.role_type == "T") {
        viewTeacherDetails(account.account_idx);
    }
    else if (account.role_type == "S") {
        viewStudentDetails(account.account_idx);
    }
    else {
        viewAdminDetails(account.account_idx);
    }

}

function viewAdminDetails(account_idx) {
    var data = "ADM_INFO;" + account_idx;        //设置ajaxpost请求字符串
    ajaxPost(PROFILE_MANAGE_URL, data, profileSingleDataBind);
    setCanvasEditable(CANVAS_ID, true);            //将canvas设置为点击无效
    setInputEditable(PROFILE_PANEL_ID, true)         //将input设为只读
}

function viewTeacherDetails(account_idx) {
    var data = "TEA_INFO;" + account_idx;
    ajaxPost(PROFILE_MANAGE_URL, data, profileSingleDataBind);
    setCanvasEditable(CANVAS_ID, true);            //将canvas设置为点击无效
    setInputEditable(PROFILE_PANEL_ID, true)         //将input设为只读
}

function viewStudentDetails(account_idx) {
    var data = "STU_INFO;" + account_idx;
    ajaxPost(PROFILE_MANAGE_URL, data, profileSingleDataBind);
    setCanvasEditable(CANVAS_ID, true);            //将canvas设置为点击无效
    setInputEditable(PROFILE_PANEL_ID, true)         //将input设为只读
}

function profileSingleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                    //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        };
        if (attriName === "student_image") {
            var student_image = obj["student_image"];
            drawCanvas(student_image);
        }
    };
}
