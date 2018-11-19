//@ sourceURL=projectManage.js
//定义几个常用的全局变量
PROJECT_MANAGE_URL = "teachManage/projectManage.ashx";
PROJECT_TABLE_ID = "dataTable";
PROJECT_MODAL_ID = "DetailModal";
DOCUMENT_NAME = "";
SCORE_MODAL_ID = "scoreModal";
EXPERT_MODAL_ID = "expertModal";
EXPERT_DETAIL_MODAL_ID = "expertDetailModal";

$(function () {
    var columns = initColumn();
    var subject_idx = cookie.get("subject_idx");
    $("#subjectIdx").val(subject_idx);                                   //定义表格字段
    BSTable(PROJECT_TABLE_ID, PROJECT_MANAGE_URL, columns);      //初始化表格
    ajaxPost("ashx/getSelectList.ashx", "getSubjectList", subjectSelectBind);    //动态获取课程下拉框

    var ability = cookie.get("projectManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = "";
        temp += '<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        $("[name='search']").removeAttr('hidden');
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">提交作品</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);


        searchProject(1);
    }
});

function searchProject(pageIndex) {

    ajaxPost(PROJECT_MANAGE_URL, "LOAD_LIST;8," + pageIndex + ";" + getSearchParas(), bindProject);
}

function bindProject(data) {
    var tableData = JSON.parse(data);
    var projectTable = tableData["rows"];
    var total = tableData["total"];
    var htmltxt = "";
    var htmltxt_Begin = "<div class='col-sm-6 col-md-3'><div class='thumbnail'>";
    var htmltxt_End = "</div></div>"
    for (var project_id in projectTable) {
        var row = projectTable[project_id];
        htmltxt += htmltxt_Begin;
        htmltxt += "<img style='height:300px' src='" + "/uploadData/" + row.subject_idx + "/project/" + row.project_file + "' alt='通用的占位符缩略图' >";
        htmltxt += "<div class='caption' ><h3>" + row.project_name + "</h3>";
        htmltxt += "<p><h5>学生：" + row.student_name + "</h5></p>";
        htmltxt += "<p><h5>批改状态：" + getProjectStatus(row.project_status) + "</h5></p>";
        htmltxt += "<p><h5>分数：" + row.project_score + "</h5></p>";
        var detail = "<p>[作品名]" + row.project_name+"<br>[学生]" + row.student_code + row.student_name + "<br>[课程]" + row.subject_name + "<br>[教师]" + row.teacher_name 
            + "<br>[状态]" + getProjectStatus(row.project_status) + "<br>[分数]" + row.project_score + "<br>[创建]" + row.project_create +"<br>[更新]"+ row.project_update+"</p>";
        var ability = cookie.get("projectManage");
        var datas = new Array();
        datas = ability.split(",");
        var btnStr = '<button type="button" class="btn btn-default" onclick= "detailProject(\'' + detail + '\')"> 详情</button>&nbsp&nbsp';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "update" && row.project_status != "2")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp';
            else if (datas[i] == "delete" && row.project_status != "2")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "delete" + '\')" > 删除</button>&nbsp&nbsp';
            else if (datas[i] == "download")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "download" + '\')"> 下载</button>&nbsp&nbsp';
            else if (datas[i] == "score" && row.subject_score_type === "T")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "score" + '\')"> 打分</button>&nbsp&nbsp';
            else if (datas[i] == "expert" && row.subject_score_type === "E")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "expert" + '\')"> 评分</button>&nbsp&nbsp';
            else if (datas[i] == "perfect" && row.project_status === "2")
                btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "perfect" + '\')"> 设为优秀</button>&nbsp&nbsp';
        }
        if (row.subject_score_type === "E")
            btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "expertDetail" + '\')"> 评分详情</button>&nbsp&nbsp';
        htmltxt += btnStr;
        htmltxt += "</div > ";
        htmltxt += htmltxt_End;
    }
    var pagecount = total / 8;
    htmltxt += "<ul class='pagination col-md-12'><li><a href='#'>&laquo;</a></li>";
    for (var i = 1; i < pagecount + 1; i++) {
        htmltxt += "<li><a href='#' onclick='searchProject("+i+")'>"+i+"</a></li>"
    }
    htmltxt += "<li><a href='#'>&raquo;</a></li></ul>";
    $('#rowdata').html(htmltxt);
}

function getProjectStatus(value) {
    if (value == "0")
        return "未批改";
    else if (value == "2")
        return "已批改";
    else if (value == "1")
        return "批改中";
    else
        return "异常状态";
}
function detailProject(detail) {
    bootbox.alert({
        message: detail,
    });
}

function initColumn() {
    return [
        { title: 'ID', field: 'project_idx', align: 'center', visible: false,},
        { title: '作品', field: 'project_name', align: 'center', },
        { title: '学号', field: 'student_code', align: 'center', },
        { title: '学生', field: 'student_name', align: 'center', },
        { title: '课程', field: 'subject_name', align: 'center', },
        { title: '教师', field: 'teacher_name', align: 'center', visible: false,},
        { title: '分数', field: 'project_score', align: 'center', },
        { title: '创建时间', field: 'project_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'project_update', align: 'center', visible: false, },

        {
            title: '批改状态', field: 'project_status', align: 'center',
            formatter: function (value, row, index) {
                if (value == "0")
                    return "未批改";
                else if (value == "2")
                    return "已批改";
                else if (value == "1")
                    return "批改中";
                else
                    return "异常状态";
            },
        },
        {
            title: '操作', field: 'project_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                var ability = cookie.get("projectManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = '';
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "update" && row.project_status != "2")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp';
                    else if (datas[i] == "delete" && row.project_status != "2")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "delete" + '\')" > 删除</button>&nbsp&nbsp';
                    else if (datas[i] == "download")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "download" + '\')"> 下载</button>&nbsp&nbsp';
                    else if (datas[i] == "score" && row.subject_score_type === "T")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "score" + '\')"> 打分</button>&nbsp&nbsp';
                    else if (datas[i] == "expert" && row.subject_score_type === "E")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "expert" + '\')"> 评分</button>&nbsp&nbsp';
                    else if (datas[i] == "perfect" && row.project_status === "2")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "perfect" + '\')"> 设为优秀</button>&nbsp&nbsp';
                }
                if (row.subject_score_type === "E")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.project_idx + '\',\'' + "expertDetail" + '\')"> 评分详情</button>&nbsp&nbsp';
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
function optBtnOnClick(project_idx, opt) {
    switch (opt) {
        case "download":
            downloadProject(project_idx);
            break;
        case "edit":
            editProject(project_idx);
            break;
        case "score":
            scoreProject(project_idx);
            break;
        case "expert":
            expertProject(project_idx);
            break;
        case "perfect":
            perfectProject(project_idx);
            break;
        case "delete":
            deleteProject(project_idx);
            break;
        case "expertDetail":
            expertDetail(project_idx);
            break;
    }
};

//详情编辑
function editProject(project_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + project_idx;       //设置ajaxpost请求字符串
    ajaxPost(PROJECT_MANAGE_URL, data, singleDataBind);
    $("#btnSave").css('display', 'inline');
    //setInputEditable(PROJECT_MODAL_ID, false);
}

//删除函数
function deleteProject(project_idx) {
    var data = "DELETE;" + project_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
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
                    searchProject(1);
                })
        },
    })
};

//新增数据
function btnInsertOnClick() {
    //下述代码用于将inputfile控件还原，先删除对应类再添加相同id的input
    var elements = document.getElementsByClassName("file-input");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    var element = document.getElementById("inputDiv");
    var inputfile = '<input type= "file" showPreview= "true" name= "txt_file" id= "txt_file" />';
    if (document.getElementById("txt_file") == null) {
        $("#inputDiv").html(inputfile);
    }


    initFileInput(PROJECT_MANAGE_URL);
    initModal();     //调出模态框
    $("#project_name").val("");
    $("#subject_idx").val($("#subjectIdx").val());
    $("#btnSave").css('display', 'inline');
    setInputEditable(PROJECT_MODAL_ID, false); 
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var project_idx = $("#project_idx").val();
    var inputData = getModalVal(PROJECT_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (project_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        if (DOCUMENT_NAME === "") {
            alert("请先上传作品再保存");
            return;
        } else {
            submitData = "INSERT;" + inputData + ";" + DOCUMENT_NAME;
            DOCUMENT_NAME = "";
        }
    }
    else {
        submitData = "UPDATE;" + project_idx + ";" + inputData;
    }
    ajaxPost(PROJECT_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
    searchProject(1);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("#studentName").val("");
    $("#projectName").val("");
    $("#search_project_status").val("");
    $("#search_project_type").val("");
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
    searchProject(1);
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
    searchProject(1);
}

//课程下拉框绑定
function subjectSelectBind(data) {
    var optionString = "";
    var subjects = eval(data);      //将返回的json字符串实例化
}


//初始化fileinput控件（第一次初始化）
function initFileInput(uploadUrl) {
    var control = $("#txt_file");

    control.fileinput({
        language: 'zh', //设置语言
        uploadUrl: uploadUrl, //上传的地址
        allowedFileExtensions: ['jpg', 'png', 'gif', 'doc', 'docx', 'mp4', 'rmvb', 'rar', 'zip', 'ppt', 'pptx', 'pps', 'ppsx', 'pdf', 'csv', 'xlsx'],
        showUpload: true,     //是否显示上传按钮
        dropZoneEnabled: false,  //是否显示拖拽区域
        showPreview: false,   //是否显示预览
        maxFileSize: 0,   //单位为kb，如果为0表示不限制文件大小
        browseClass: "btn btn-primary", //按钮样式   
        showCaption: true,   //是否显示选择文件框
        uploadAsync: true,   //是否为异步上传
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
        var projectName = DOCUMENT_NAME.replace("_", "||");    //将新文件名中的第一个下划线替换为双竖线，处理文件名中本身含有下划线的情况
        $("#project_name").val(projectName.split("||")[1]);
        if (data == undefined) {
            toastr.error('上传错误');
            return;
        }
    });
}

//作品下载函数
function downloadProject(project_idx) {
    var submitData = "GET_DOWNLOAD_URL;" + project_idx;      //定义提交的数据
    ajaxPost(PROJECT_MANAGE_URL, submitData, function (data) {
        window.open("uploadData/" + $("#subjectIdx").val() + "/project/" + data)
    })
}

//作品打分
function scoreProject(project_idx) {
    initModal(SCORE_MODAL_ID);           //调出模态框
    $("#score_project_idx").val(project_idx);
}

//专家打分
function expertProject(project_idx) {
    initModal(EXPERT_MODAL_ID);           //调出模态框
    $("#expert_project_idx").val(project_idx);
}


//打分框保存按钮
function btnScoreSaveOnClick() {
    var project_idx = $("#score_project_idx").val();
    var project_score = $("#score_project").val();
    var project_comment = $("#project_comment").val();
    ajaxPost(PROJECT_MANAGE_URL, "SCORE;" + project_idx + ";" + project_score + ";" + project_comment, operateSuccess);
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
    searchProject(1);
    $("#" + SCORE_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
}


//评分框保存按钮
function btnExpertSaveOnClick() {
    var project_idx = $("#expert_project_idx").val();
    var project_score = $("#expert_project").val();
    var expert_comment = $("#expert_comment").val();
    ajaxPost(PROJECT_MANAGE_URL, "EXPERT;" + project_idx + ";" + project_score + ";" + expert_comment, operateSuccess);
    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
    searchProject(1);
    $("#" + SCORE_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
}

//设置为优秀作品函数
function perfectProject(project_idx) {
    var data = "PERFECT;" + project_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认设为优秀作品？",
        callback: function (result) {
            if (result == true)
                ajaxPost(PROJECT_MANAGE_URL, data, function (result) {
                    var resultMassage = result === "0" ? "操作失败" : "设置成功";
                    bootbox.alert({
                        message: resultMassage,
                    });
                    refresh(PROJECT_TABLE_ID, PROJECT_MANAGE_URL);
                    searchProject(1);
                })
        },
    })
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.subjectManage");
    window.location.href = "./framepage.html";
}

//专家详情
function expertDetail(project_idx) {
    $("#tbMain").html("");                     //清空tbody内容
    initModal(EXPERT_DETAIL_MODAL_ID);
    submitData = "EXPERT_DETAIL;" + project_idx;
    ajaxPost(PROJECT_MANAGE_URL, submitData, function (data) {
        var tbody = document.getElementById('tbMain');
        var experts = eval(data);
        for (var i = 0; i < experts.length; i++) { //遍历一下json数据
            var trow = getDataRow(experts[i]); //定义一个方法,返回tr数据
            tbody.appendChild(trow);
        }
    })
}

//返回专家打分详情的每行数据
function getDataRow(h) {
    var row = document.createElement('tr'); //创建行

    var nameCell = document.createElement('td'); //创建第一列id
    nameCell.innerHTML = h.account_name; //填充数据
    row.appendChild(nameCell); //加入行  ，下面类似

    var scoreCell = document.createElement('td');//创建第二列name
    scoreCell.innerHTML = h.project_score;
    row.appendChild(scoreCell);

    var commentCell = document.createElement('td');//创建第三列job
    commentCell.innerHTML = h.project_comment;
    row.appendChild(commentCell);

    return row; //返回tr数据	 
}
