//@ sourceURL=perfectProjectManage.js
//定义几个常用的全局变量
PROJECT_MANAGE_URL = "informationManage/perfectProjectManage.ashx";
PROJECT_TABLE_ID = "dataTable";
PROJECT_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColumn();                                    //定义表格字段
    BSTable(PROJECT_TABLE_ID, PROJECT_MANAGE_URL, colunms);      //初始化表格
    ajaxPost("ashx/getSelectList.ashx", "getSubjectList", subjectSelectBind);    //动态获取课程下拉框
    bootBoxInit();
});

function initColumn() {
    return [
        { title: 'ID', field: 'perfect_project_idx', align: 'center', },
        { title: '作品', field: 'perfect_project_name', align: 'center', },
        { title: '学号', field: 'student_code', align: 'center', },
        { title: '学生', field: 'student_name', align: 'center', },
        { title: '课程', field: 'subject_name', align: 'center', },
        { title: '教师', field: 'teacher_name', align: 'center', },
        { title: '分数', field: 'perfect_project_score', align: 'center', },
        {
            title: '是否展示', field: 'home_page_flag', align: 'center',
            formatter: function (value, row, index) {
                return value == "1" ? "是" : "否";
            }
        },
        { title: '创建时间', field: 'perfect_project_create', align: 'center', },
        { title: '更新时间', field: 'perfect_project_update', align: 'center', },
        {
            title: '操作', field: 'project_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                var btnStr = '';
                btnStr += '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.perfect_project_idx + '\',\'' + "download" + '\')">下载</button>&nbsp&nbsp';
                if (row.home_page_flag === "1") {
                    btnStr += '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.perfect_project_idx + '\',\'' + "showOff" + '\')">取消展示</button>&nbsp&nbsp';
                } else {
                    btnStr += '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.perfect_project_idx + '\',\'' + "showOn" + '\',\'' + row.perfect_project_file + '\')">首页展示</button>&nbsp&nbsp';
                }
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.perfect_project_idx + '\',\'' + "delete" + '\')" >删除</button >';
                return btnStr;
            }
        }
    ];
};

//调出模态框
function initModal(modalId = PROJECT_MODAL_ID) {
    $('#' + modalId).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(perfect_project_idx, opt,perfect_project_file) {
    switch (opt) {
        case "download":
            downloadProject(perfect_project_idx);
            break;
        case "showOn":
            showOnProject(perfect_project_idx, perfect_project_file);
            break;
        case "showOff":
            showOffProject(perfect_project_idx);
            break;
        case "delete":
            deleteProject(perfect_project_idx);
            break;
    }
};

function bootBoxInit() {
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
}

//首页展示
function showOnProject(perfect_project_idx, perfect_project_file) {
    var suffix = perfect_project_file.split('.')[1].toLowerCase();
    var suffixArray = ['jpg', 'png', 'jpeg', 'bmp']
    if (suffixArray.indexOf(suffix) == -1) {
        alert("只能够将图片格式设置为首页展示！");
        return;
    }
    var data = "SHOWON;" + perfect_project_idx;         //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确定将该作品设为首页展示？若当前展示的作品超过三幅，则展示时间最长的作品会被取消展示",
        callback: function (result) {
            if (result == true)
                ajaxPost(PROJECT_MANAGE_URL, data, function (data) {
                    var resultMassage = result === "0" ? "操作失败" : data;
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
                })
        },
    })
};

//取消首页展示
function showOffProject(perfect_project_idx) {
    var data = "SHOWOFF;" + perfect_project_idx;         //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确定取消该作品首页展示？",
        callback: function (result) {
            if (result == true)
                ajaxPost(PROJECT_MANAGE_URL, data, function (data) {
                    var resultMassage = result === "0" ? "操作失败" : data;
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
                })
        },
    })
};

//删除函数
function deleteProject(perfect_project_idx) {
    var data = "DELETE;" + perfect_project_idx;         //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(PROJECT_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "删除成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
                })
        },
    })
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    if (result == "0") {
        alert("操作失败！")
    }
    else if (result == "查询成功") {

    }
    else {
        alert(result);
        $("#" + PROJECT_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    }
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
}

//课程下拉框绑定
function subjectSelectBind(data) {
    var optionString = "";
    var subjects = eval(data);      //将返回的json字符串实例化
    subjects.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.subject_idx + "'\>" + item.subject_name + "</option>"; //动态添加数据
    })
    $("#subject_idx").append(optionString);  // 为当前name为asd的select添加数据。 
}

//作品下载函数
function downloadProject(perfect_project_idx) {
    var submitData = "GET_DOWNLOAD_URL;" + perfect_project_idx;      //定义提交的数据
    ajaxPost(PROJECT_MANAGE_URL, submitData, function (data) {
        window.open("uploadData/project/" + data)
    })
}

