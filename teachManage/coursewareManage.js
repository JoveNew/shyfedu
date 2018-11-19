//@ sourceURL=coursewareManage.js
//定义几个常用的全局变量
COURSEWARE_MANAGE_URL = "teachManage/coursewareManage.ashx";
COURSEWARE_TABLE_ID = "dataTable";
COURSEWARE_MODAL_ID = "DetailModal";
DOCUMENT_NAME = "";

$(function () {
    var colunms = initColumn();
    var subject_idx = cookie.get("subject_idx");
    $("#subjectIdx").val(subject_idx);
    //定义表格字段
    BSTable(COURSEWARE_TABLE_ID, COURSEWARE_MANAGE_URL, colunms);      //初始化表格
    ajaxPost("ashx/getSelectList.ashx", "getSubjectList", subjectSelectBind);    //动态获取课程下拉框
    initFileInput("txt_file", COURSEWARE_MANAGE_URL);

    var ability = cookie.get("coursewareManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = "";
        temp += '<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        $("[name='search']").removeAttr('hidden');
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">提交课件</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);
    }
});

function initColumn() {
    return [
        { title: 'ID', field: 'courseware_idx', align: 'center', visible: false,},
        { title: '课件名', field: 'courseware_name', align: 'center', },
        { title: '课程', field: 'subject_name', align: 'center', },
        { title: '教师', field: 'teacher_name', align: 'center', },
        { title: '创建时间', field: 'courseware_create', align: 'center', visible: false },
        { title: '更新时间', field: 'courseware_update', align: 'center', visible: false },
        {
            title: '操作', field: 'courseware_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                var ability = cookie.get("coursewareManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = '';
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "update")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.courseware_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp';
                    else if (datas[i] == "delete")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.courseware_idx + '\',\'' + "delete" + '\')" > 删除</button>&nbsp&nbsp';
                    else if (datas[i] == "download")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.courseware_idx + '\',\'' + "download" + '\')"> 下载</button>&nbsp&nbsp';
                }
                return btnStr;
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + COURSEWARE_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(courseware_idx, opt) {
    switch (opt) {
        case "download":
            downloadHomework(courseware_idx);
            break;
        case "edit":
            editHomework(courseware_idx);
            break;
        case "score":
            scoreHomework(courseware_idx);
            break;
        case "delete":
            deletecourseware(courseware_idx);
            break;
    }
};

//详情编辑
function editHomework(courseware_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + courseware_idx;       //设置ajaxpost请求字符串
    ajaxPost(COURSEWARE_MANAGE_URL, data, singleDataBind);
    $("#btnSave").css('display', 'inline');
    //setInputEditable(COURSEWARE_MODAL_ID, false);
}

//删除函数
function deletecourseware(courseware_idx) {
    var data = "DELETE;" + courseware_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(COURSEWARE_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "删除成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(COURSEWARE_TABLE_ID, COURSEWARE_MANAGE_URL);
                })
        },
    })
};

//新增数据
function btnInsertOnClick() {
    initModal();     //调出模态框
    $("#courseware_name").val("");
    $("#subject_idx").val($("#subjectIdx").val());
    $("#btnSave").css('display', 'inline');
    setInputEditable(COURSEWARE_MODAL_ID, false);
    initFileInput("txt_file", COURSEWARE_MANAGE_URL);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var courseware_idx = $("#courseware_idx").val();
    var inputData = getModalVal(COURSEWARE_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (courseware_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        if (DOCUMENT_NAME === "") {
            alert("请先上传课件再保存");
            return;
        } else {
            submitData = "INSERT;" + inputData + ";" + DOCUMENT_NAME;
            DOCUMENT_NAME = "";
        }
    }
    else {
        submitData = "UPDATE;" + courseware_idx + ";" + inputData;
    }
    ajaxPost(COURSEWARE_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(COURSEWARE_TABLE_ID, COURSEWARE_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("#coursewareName").val("");
    $("#teacherName").val("");
    refresh(COURSEWARE_TABLE_ID, COURSEWARE_MANAGE_URL);
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
        $("#" + COURSEWARE_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    }
    refresh(COURSEWARE_TABLE_ID, COURSEWARE_MANAGE_URL);
}

//课程下拉框绑定
function subjectSelectBind(data) {
    var optionString = "";
    var subjects = eval(data);      //将返回的json字符串实例化
}


//初始化fileinput控件（第一次初始化）
function initFileInput(ctrlId, uploadUrl) {
    var control = $('#' + ctrlId);

    control.fileinput({
        language: 'zh', //设置语言
        uploadUrl: uploadUrl, //上传的地址
        allowedFileExtensions: ['jpg', 'png', 'gif', 'doc', 'docx', 'mp4', 'rmvb', 'rar', 'zip', 'ppt', 'pptx', 'pps', 'ppsx','pdf','csv','xlsx'],//接收的文件后缀
        showUpload: true,     //是否显示上传按钮
        dropZoneEnabled: false,  //是否显示拖拽区域
        showPreview: false,   //是否显示预览
        maxFileSize: 0, //单位为kb，如果为0表示不限制文件大小
        browseClass: "btn btn-primary", //按钮样式   
        showCaption: true,   //是否显示选择文件框
        uploadAsync: true,   //是否为异步上传
        //enctype: 'multipart/form-data',
        uploadExtraData: function () {//向后台传递参数
            var data = {
                subjectIdx: $("#subjectIdx").val(),
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

//课件下载函数
function downloadHomework(courseware_idx) {
    var submitData = "GET_DOWNLOAD_URL;" + courseware_idx;      //定义提交的数据
    ajaxPost(COURSEWARE_MANAGE_URL, submitData, function (data) {
        window.open("uploadData/" + $("#subjectIdx").val()+"/courseware/"+data)
    })
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.subjectManage");
    window.location.href = "./framepage.html";
}