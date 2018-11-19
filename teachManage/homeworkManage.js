//@ sourceURL=homeworkManage.js
//定义几个常用的全局变量
HOMEWORK_MANAGE_URL = "teachManage/homeworkManage.ashx";
HOMEWORK_TABLE_ID = "dataTable";
HOMEWORK_MODAL_ID = "DetailModal";
SCORE_MODAL_ID = "scoreModal";
DOCUMENT_NAME = "";

$(function () {
    var lessonIdx = cookie.get("lesson_idx");
    $("#lesson_idx").val(lessonIdx);
    var colunms = initColumn();                                    //定义表格字段
    BSTable(HOMEWORK_TABLE_ID, HOMEWORK_MANAGE_URL, colunms);      //初始化表格
    ajaxPost("ashx/getSelectList.ashx", "getLessonList", lessonSelectBind);    //动态获取课程下拉框
    initFileInput("txt_file", HOMEWORK_MANAGE_URL);

    var ability = cookie.get("homeworkManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = "";
        temp += '<button type="button" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
                '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">提交作业</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);
    }
});

function initColumn() {
    return [
        { title: 'ID', field: 'homework_idx', align: 'center', visible: false,},
        { title: '学号', field: 'student_code', align: 'center', },
        { title: '学生', field: 'student_name', align: 'center', },
        { title: '教师', field: 'teacher_name', align: 'center', },
        { title: '作业名', field: 'homework_name', align: 'center', },
        { title: '分数', field: 'homework_score', align: 'center', },
        {
            title: '批改状态', field: 'homework_status', align: 'center',
            formatter: function (value, row, index) {
                return value === "0" ? "未批改" : "已批改";
            },
        },
        { title: '创建时间', field: 'homework_create', align: 'center', visible: false,},
        { title: '更新时间', field: 'homework_update', align: 'center', visible: false,},
        {
            title: '操作', field: 'homework_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var ability = cookie.get("homeworkManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = "";
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "download") {
                        btnStr += '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.homework_idx + '\',\'' + "download" + '\')">下载</button>&nbsp&nbsp';
                    }
                    else if (datas[i] == "update" && row.homework_status != "1")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.homework_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp';
                    else if (datas[i] == "score")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.homework_idx + '\',\'' + "score" + '\')">打分</button>&nbsp&nbsp';
                    else if (datas[i] == "delete" && row.homework_status != "1")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.homework_idx + '\',\'' + "delete" + '\')">删除</button>&nbsp&nbsp';
                }
                return btnStr;
            },
        }];
};

//调出模态框
function initModal(modal_Id) {
    $('#' + modal_Id).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(homework_idx, opt) {
    switch (opt) {
        case "download":
            downloadHomework(homework_idx);
            break;
        case "edit":
            editHomework(homework_idx);
            break;
        case "score":
            scoreHomework(homework_idx);
            break;
        case "delete":
            deletehomework(homework_idx);
            break;
    }
};

//详情编辑
function editHomework(homework_idx) {
    initModal(HOMEWORK_MODAL_ID);                             //调出模态框
    var data = "LOAD_INFO;" + homework_idx;       //设置ajaxpost请求字符串
    ajaxPost(HOMEWORK_MANAGE_URL, data, singleDataBind);
    $("#btnSave").css('display', 'inline');
    //setInputEditable(HOMEWORK_MODAL_ID, false);
}

//删除函数
function deletehomework(homework_idx) {
    var data = "DELETE;" + homework_idx;         //设置ajaxpost请求字符串
    ajaxPost(HOMEWORK_MANAGE_URL, data, operateSuccess);
};

//新增数据
function btnInsertOnClick() {
    initModal(HOMEWORK_MODAL_ID);     //调出模态框
    $("input[name='submitData']").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(HOMEWORK_MODAL_ID, false);
    initFileInput("txt_file", HOMEWORK_MANAGE_URL);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var homework_idx = $("#homework_idx").val();
    var inputData = getModalVal(HOMEWORK_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    var lessonIdx = $("#lesson_idx").val();
    if (homework_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        if (DOCUMENT_NAME === "") {
            alert("请先上传作业再保存");
            return;
        } else {
            submitData = "INSERT;" + inputData + ";" + DOCUMENT_NAME + ";" + lessonIdx;
            DOCUMENT_NAME = "";
        }
    }
    else {
        submitData = "UPDATE;" + homework_idx + ";" + inputData;
    }
    ajaxPost(HOMEWORK_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(HOMEWORK_TABLE_ID, HOMEWORK_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("#search_student_code").val("");
    $("#search_student_name").val("");
    $("#search_homework_status").val("");
    refresh(HOMEWORK_TABLE_ID, HOMEWORK_MANAGE_URL);
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
        $("#" + HOMEWORK_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    }
    refresh(HOMEWORK_TABLE_ID, HOMEWORK_MANAGE_URL);
}

//课程下拉框绑定
function lessonSelectBind(data) {
    var optionString = "";
    var lessons = eval(data);      //将返回的json字符串实例化
    lessons.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.lesson_idx + "'\>" + item.lesson_name +"</option>"; //动态添加数据
    })
    $("#lesson_name").append(optionString);  // 为当前name为asd的select添加数据。 
}


//初始化fileinput控件（第一次初始化）
function initFileInput(ctrlId, uploadUrl) {
    var control = $('#' + ctrlId);

    control.fileinput({
        language: 'zh', //设置语言
        uploadUrl: uploadUrl, //上传的地址
        allowedFileExtensions: ['jpg', 'png', 'gif', 'doc', 'docx', 'mp4', 'rmvb', 'rar', 'zip', 'ppt', 'pptx', 'pps', 'ppsx', 'pdf', 'csv', 'xlsx'],
        showUpload: true,     //是否显示上传按钮
        dropZoneEnabled: false,  //是否显示拖拽区域
        showPreview: false,   //是否显示预览
        maxFileSize: 0,//单位为kb，如果为0表示不限制文件大小
        browseClass: "btn btn-primary", //按钮样式   
        showCaption: true,   //是否显示选择文件框
        uploadAsync: true,   //是否为异步上传
        uploadExtraData: function () {//向后台传递参数
            var data = {
                subjectIdx: cookie.get("subject_idx"),
            };
            return data;
        },

    })

    //导入文件上传完成之后的回调事件
    //注意：只有当返回的数据是严格的json数据或者json格式字符串时才会调用函数！
    $('#txt_file').on("fileuploaded", function (event, data) {
        DOCUMENT_NAME = data.response.filenewname;
        if (data == undefined) {
            toastr.error('上传错误');
            return;
        }
    });
}

//作业下载函数
function downloadHomework(homework_idx) {
    var submitData = "GET_DOWNLOAD_URL;" + homework_idx;      //定义提交的数据
    ajaxPost(HOMEWORK_MANAGE_URL, submitData, function (data) {
        window.open("uploadData/" + cookie.get("subject_idx") + "/homework/" + data)
    })
}

//打分函数
function scoreHomework(homework_idx) {
    initModal(SCORE_MODAL_ID);           //调出模态框
    $("#score_homework_idx").val(homework_idx);
}

//打分框保存按钮
function btnScoreSaveOnClick() {
    var homework_idx = $("#score_homework_idx").val();
    var homework_score = $("#score_homework").val();
    ajaxPost(HOMEWORK_MANAGE_URL, "SCORE;" + homework_idx + ";" + homework_score, operateSuccess);
    refresh(HOMEWORK_TABLE_ID, HOMEWORK_MANAGE_URL);
    $("#" + SCORE_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.lessonManage");
    window.location.href = "./framepage.html";
}