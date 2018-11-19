/*
作者：qianqi
创建日期：2018.9.21
文档说明：

*/

ACCOUNT_MANAGE_URL = "systemManage/userManage.ashx";
ACCOUNT_TABLE_ID = "dataTable";
ACCOUNT_MODAL_ID = "DetailModal";
//CANVAS_ID = "image_can";
IMG_ARRAY = new Array();
GET_SELECT_LIST = "ashx/getSelectList.ashx";

$(function () {
    var colunms = initColunm();
    BSTable(ACCOUNT_TABLE_ID, ACCOUNT_MANAGE_URL, colunms);
    $("#major_name").val(loadSelect("getMajorList"));
    $("#academy_code").val(loadSelect("getAcademyList"));
});

function initColunm() {
    return [
        { title: 'ID', field: 'account_idx', align: 'center', visible: false },
        { title: '用户名', field: 'account_name', align: 'center', },
        { title: '关联ID', field: 'account_link_idx', align: 'center', visible: false },
        { title: '关联名', field: 'link_name', align: 'center', },
        {
            title: '角色', field: 'role_type', align: 'center',
            formatter: function (value, row, index) {
                if (row.role_type == 'S') {
                    return '<label style="text-align: center; ">学生 </label>';
                }
                else if (row.role_type == 'T') {
                    return '<label style="text-align: center; ">教师 </label>';
                }
                else if (row.role_type == 'M') {
                    return '<label style="text-align: center; ">管理员 </label>';
                }
                else if (row.role_type == 'E') {
                    return '<label style="text-align: center; ">专家 </label>';
                }
                else if (row.role_type == 'A') {
                    return '<label style="text-align: center; ">系统管理员 </label>';
                }
            }
        },
        {
            title: '启用状态', field: 'account_delete', align: 'center',
            formatter: function (value, row, index) {
                if (row.account_delete == 'True') {
                    return '<label style="text-align: center; ">冻结 </label>';
                }
                else {
                    return '<label style="text-align: center; ">激活 </label>';
                }
            }
        },
        { title: '最后登录', field: 'pw_last_login', align: 'center', visible: false },
        { title: '微信登录', field: 'wx_last_login', align: 'center', visible: false },
        { title: '创建时间', field: 'account_create', align: 'center', visible: false },
        { title: '更新时间', field: 'account_update', align: 'center', visible: false},
        {
            title: '操作', field: 'account_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                //return '<a onclick="optBtnOnClick(\'' + row.account_idx + '\',\'' + "edit" + '\')">编辑</a>&nbsp&nbsp\
                //        <a onclick= "optBtnOnClick(\'' + row.account_idx + '\',\'' + "active" + '\')">激活</a >&nbsp&nbsp\
                //        <a onclick= "optBtnOnClick(\'' + row.account_idx + '\',\'' + "delete" + '\')" > 冻结</a > ';

                if ( row.account_delete== "True") {
                    return '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.account_idx + '\',\'' + "edit" + '\')">编辑</button>&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.account_idx + '\',\'' + "active" + '\')">激活</button >';
                }
                else {
                    return '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.account_idx + '\',\'' + "edit" + '\')">编辑</button>&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.account_idx + '\',\'' + "delete" + '\')" > 冻结</button >';
                }
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + ACCOUNT_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(account_idx, opt) {
    switch (opt) {
        case "active":
            activeAccount(account_idx);
            break;
        case "edit":
            editDetails(account_idx);
            break;
        case "delete":
            deleteAccount(account_idx);
            break;
    }
};

//详情编辑
function editDetails(account_idx) {
    initModal();                    //调出模态框
    var data = "LOAD_INFO;" + account_idx;        //设置ajaxpost请求字符串
    ajaxPost(ACCOUNT_MANAGE_URL, data, accountSingleDataBind);
    $("#btnSave").css('display', 'inline');
    setInputEditable(ACCOUNT_MODAL_ID, false);
    $("select").removeAttr('disabled');
};

//激活
function activeAccount(account_idx) {
    var data = "ACTIVE;" + account_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认激活？",
        callback: function (result) {
            if (result == true)
                ajaxPost(ACCOUNT_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true
    })
};

//删除
function deleteAccount(account_idx) {
    var data = "DELETE;" + account_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认冻结？",
        callback: function (result) {
            if (result == true)
                ajaxPost(ACCOUNT_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true
    })
};

//新增数据
function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input").val("");
    $("select").val("");
  //  $("account_idx").val("");
    $("select").removeAttr("disabled");
    $("#btnSave").css('display', 'inline');
    setCanvasEditable(CANVAS_ID, false);
    setInputEditable(ACCOUNT_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var account_idx = $("#account_idx").val();
    var inputData = getModalVal(ACCOUNT_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (account_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
    {
        submitData = "INSERT;" + inputData;
    }
    else {
        submitData = "UPDATE;" + account_idx + ";" + inputData;
    }
    ajaxPost(ACCOUNT_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(ACCOUNT_TABLE_ID, ACCOUNT_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("input[name='search']").val("");
    $("select[name='search']").val("");
    refresh(ACCOUNT_TABLE_ID, ACCOUNT_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    if (result == "0") {
        bootbox.alert({
            message: "操作失败！",
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
        $("#" + ACCOUNT_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    }
    refresh(ACCOUNT_TABLE_ID, ACCOUNT_MANAGE_URL);
}

//从数据库获取到单条数据利用空间id绑定到模态框对应的input控件，主要用于查看详情和编辑时获取初始数据
//data：调用ajax返回的数据
function accountSingleDataBind(data) {

    var obj = eval(data)[0];
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0)
            $("#" + attriName).val(obj[attriName]);
    }
}

function loadSelect(data) {
    ajaxPost(GET_SELECT_LIST, data, selectBind);
}

function selectBind(data) {
    var obj = eval(data);
    var acatemp = "";
    var majtemp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.academy_code) == "string") {
            acatemp += "<option value=" + datas.academy_code + ">" + datas.academy_name + "</option>";
        }
    }
    $("#academy_code").append(acatemp);
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.major_code) == "string")
            majtemp += "<option value=" + datas.major_code + ">" + datas.major_name + "</option>";
    }
    $("#major_code").append(majtemp);
}
