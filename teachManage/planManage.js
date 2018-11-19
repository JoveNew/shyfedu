PLAN_MANAGE_URL = "teachManage/planManage.ashx";
PLAN_TABLE_ID = "dataTable";
PLAN_MODAL_ID = "DetailModal";
DOCUMENT_NAME = "";
subject_idx = cookie.get("subject_idx");
account_link_idx = cookie.get("account_link_idx");
account_idx = cookie.get("account_idx");

$(function () {
    var colunms = initColumn();                                    //定义表格字段
    $(".subject_idx").val(subject_idx);
    $(".account_idx").val(account_idx);
    BSTable(PLAN_TABLE_ID, PLAN_MANAGE_URL, colunms);      //初始化表格
    initFileInput("plan_file", PLAN_MANAGE_URL);
    var ability = cookie.get("planManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp ='<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
                  '<button type="button" class="btn btn-default" onclick="btnResetOnClick()">重置</button>';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert")
                temp += "<button type='button' class='btn btn-default ' onclick='btnInsertOnClick()'>新增</button>";
        }
        temp += "<button type='button' class='btn btn-default ' onclick='btnBackOnClick()'>返回</button>";
        $("div #tool").append(temp);
    }
});

function initColumn() {
    return [
        { title: 'ID', field: 'plan_idx', align: 'center', visible: false },
        { title: '名称', field: 'plan_name', align: 'center', },
        { title: '课程', field: 'subject_name', align: 'center', },
        { title: '周', field: 'plan_week', align: 'center', },
        {
            title: '状态', field: 'plan_state', align: 'center',
            formatter: function (plan_state) {
                if (plan_state == "N")
                    return '待提交';
                else if (plan_state == "C")
                    return '待审核';
                else if (plan_state == "F")
                    return '已审核';
            }
        },
        { title: '创建时间', field: 'plan_create', align: 'center', visible: false},
        { title: '更新时间', field: 'plan_update', align: 'center', visible: false},
        {
            title: '类型', field: 'plan_type', align: 'center',
            formatter: function (plan_type) {
                var type = "";
                if (plan_type == "1")
                    type = "课程教案";
                else if (plan_type == "3")
                    type = "教学计划";
                else if (plan_type == "2")
                    type = "教学进度";
                else if (plan_type == "4")
                    type = "成绩分析";
                return type;
            }
        },
        { title: '提交人', field: 'teacher_name', align: 'center', },
        { title: '审核人', field: 'account_name', align: 'center', },
        {
            title: '操作', field: 'plan_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                var ability = cookie.get("planManage");
                if (ability != undefined) {
                    var datas = new Array();
                    datas = ability.split(",");
                    var temp = '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + ',' + row.plan_type + '\',\'' + "detail" + '\')" >查看';
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i] == "download" && row.plan_type == "0")
                            temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "download" + '\')">下载</a>';
                        else if (datas[i] == "update") {
                            if (row.plan_state == "N") {
                                if (row.plan_type == "1")
                                    temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "editTeachCase" + '\')">编辑 ';
                                else if (row.plan_type == "3")
                                    temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "editTeachPlan" + '\')">编辑 ';
                                else if (row.plan_type == "2")
                                    temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "editPlanOfContentAndSchedule" + '\')">编辑 ';
                                else if (row.plan_type == "4")
                                    temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "editQuality" + '\')">编辑 ';
                                temp += '<button type="submit" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "submit" + '\')">提交';
                            }
                        }
                        else if (datas[i] == "delete" && row.plan_type == "0")
                            temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "delete" + '\')" >删除 ';
                        else if (datas[i] == "copy" && row.plan_type == "1")
                            temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + ',' + row.subject_idx + '\',\'' + "copy" + '\')" >复制';
                        else if (datas[i] == "check" && row.plan_state == "C") {
                            temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "checkPass" + '\')" >审核通过';
                            temp += '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.plan_idx + '\',\'' + "checkBack" + '\')" >审核不通过';
                        }
                    }
                }
                return temp;
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + PLAN_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(paras, opt) {
    switch (opt) {
        case "download":
            downloadPlan(paras);
            break;
        case "editTeachCase":
            gotoTeachCase(paras);
            break;
        case "editPlanOfContentAndSchedule":
            gotoPlanOfContentAndSchedule(paras);
            break;
        case "editTeachPlan":
            gotoTeachPlan(paras);
            break;
        case "editQuality":
            gotoQualityManage(paras);
            break; 
        case "delete":
            deletePlan(paras);
            break;
        case "copy":
            copyPlan(paras);
            break;
        case "submit":
            submitPlan(paras);
            break;
        case "detail":
            detailPlan(paras);
            break;
        case "checkPass":
            checkPass(paras);
            break;
        case "checkBack":
            checkBack(paras);
            break;
    }
};


//删除函数
function deletePlan(plan_idx) {
    var data = "DELETE;" + plan_idx;         //设置ajaxpost请求字符串
    ajaxPost(PLAN_MANAGE_URL, data, operateSuccess);
};

//新增数据
function btnInsertOnClick() {
    initModal();     //调出模态框
    $("input[name='submitData']").val("");
    $("select").val("NULL");
    $("#subject_idx").val(subject_idx);
    $("#teacher_idx").val(account_link_idx);
    $("#account_idx").val(account_idx);
    $("#btnSave").css('display', 'inline');
    setInputEditable(PLAN_MODAL_ID, false);
    initFileInput("plan_file", PLAN_MANAGE_URL);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var plan_idx = $("#planIdx").val();
    var inputData = getModalVal(PLAN_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (plan_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        if (DOCUMENT_NAME === "") {
            alert("请上传文件！");
            return;
        } else {
            submitData = "INSERT;" + inputData + ";" + DOCUMENT_NAME;
            DOCUMENT_NAME = "";
        }
    }
    else {
        submitData = "UPDATE;" + plan_idx + ";" + inputData;
    }
    ajaxPost(PLAN_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(PLAN_TABLE_ID, PLAN_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $(".visible").val("");   
    refresh(PLAN_TABLE_ID, PLAN_MANAGE_URL);
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.subjectManage");
    window.location.href = "./framepage.html";
}

//ajax成功回调函数，根据返回的result显示提示信息
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
    $("#" + PLAN_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    $("#planCopy").modal('hide');
    refresh(PLAN_TABLE_ID, PLAN_MANAGE_URL);
}


//初始化fileinput控件（第一次初始化）
function initFileInput(ctrlId, uploadUrl) {
    var control = $('#' + ctrlId);

    control.fileinput({
        language: 'zh', //设置语言
        uploadUrl: uploadUrl, //上传的地址
        allowedFileExtensions: ['jpg', 'png', 'gif', 'doc', 'docx', 'mp4', 'rmvb', 'rar', 'zip', 'ppt', 'pptx'],//接收的文件后缀
        showUpload: true,     //是否显示上传按钮
        dropZoneEnabled: false,  //是否显示拖拽区域
        showPreview: false,   //是否显示预览
        maxFileSize: 0,//单位为kb，如果为0表示不限制文件大小
        browseClass: "btn btn-primary", //按钮样式   
        showCaption: true,   //是否显示选择文件框
        uploadAsync: true,   //是否为异步上传
        uploadExtraData: function () {//向后台传递参数
            var data = {
                subjectIdx: subject_idx
            };
            return data;
        },
    })

    //导入文件上传完成之后的回调事件
    //注意：只有当返回的数据是严格的json数据或者json格式字符串时才会调用函数！
    $('#plan_file').on("fileuploaded", function (event, data) {
        DOCUMENT_NAME = data.response.filenewname;
        if (data == undefined) {
            toastr.error('上传错误');
            return;
        }
    });
}

//作业下载函数
function downloadPlan(plan_idx) {
    var submitData = "GET_DOWNLOAD_URL;" + plan_idx;      //定义提交的数据
    ajaxPost(PLAN_MANAGE_URL, submitData, function (data) {
        window.open("uploadData/plan/" + subject_idx + "/plan/" + data)
    })
}

function gotoTeachCase(plan_idx) {
    cookie.set("plan_idx", plan_idx);
    cookie.set("judgeFunction", "0");
    cookie.set("path", "teachManage.teachCase");
    window.location.href = "./framepage.html";
}

function gotoPlanOfContentAndSchedule(plan_idx) {
    cookie.set("plan_idx", plan_idx);
    cookie.set("judgeFunction", "0");
    cookie.set("path", "teachManage.planOfContentAndSchedule");
    window.location.href = "./framepage.html";
}

function gotoTeachPlan(plan_idx) {
    cookie.set("plan_idx", plan_idx);
    cookie.set("judgeFunction", "0");
    cookie.set("path", "teachManage.teachPlan");
    window.location.href = "./framepage.html";
}

function gotoQualityManage(plan_idx) {
    cookie.set("plan_idx", plan_idx);
    cookie.set("subjecy_idx", subject_idx);
    cookie.set("judgeFunction", "0");
    cookie.set("path", "teachManage.qualityManage");
    window.location.href = "./framepage.html";
}

function copyPlan(paras) {
    $("#planCopy").modal({
        keyboard: false
    });
    var planIdx = paras.split(',')[0];
    var subjectIdx = paras.split(',')[1];
    var str = "WEEK;" + subjectIdx;
    ajaxPost(PLAN_MANAGE_URL, str, selectBind);
    var submitData = "LOAD_INFO;" + planIdx;
    ajaxPost(PLAN_MANAGE_URL, submitData, ModalDataBind);
}

function selectBind(result) {
    var obj = eval(result);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].plan_week != "0") {
            temp += "<option value='" + obj[i].plan_week + "'>" + obj[i].plan_week + "</option>";
        }
    }
    $("#plan_week").html(temp);
}

function ModalDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {
        $("#planCopy [name='planCopy']").each(function () {
            var id = $(this).attr("id");
            if (id == attriName)
                $(this).val(obj[attriName]);
        });
    };
} 

function btnSave() {
    var submitData = "COPY;";
    var inputData = "";
    $("#planCopy [name='planCopy']").each(function () {
        inputData += $(this).val() + ";";
    })
    submitData += inputData;
    ajaxPost(PLAN_MANAGE_URL, submitData, operateSuccess);
}

function submitPlan(plan_idx) {
    var submitData = "SUBMIT;" + plan_idx;
    bootbox.confirm({
        message: "确认提交该教案",
        callback: function (result) {
            if (result == true)
                ajaxPost(PLAN_MANAGE_URL, submitData, operateSuccess);
        },
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    })
}

function detailPlan(paras) {
    var planType = paras.split(',')[1];
    var planIdx = paras.split(',')[0];
    cookie.set("plan_idx", planIdx);
    cookie.set("judgeFunction", "1");
    if (planType == "1")
        cookie.set("path", "teachManage.teachCase");
    else if (planType == "2")
        cookie.set("path", "teachManage.planOfContentAndSchedule");
    else if (planType == "3")
        cookie.set("path", "teachManage.teachPlan");
    else if (planType == "4")
        cookie.set("path", "teachManage.qualityManage");
    window.location.href = "./framepage.html";
}

function checkPass(plan_idx) {
    var submitData = "CHECKPASS;" + plan_idx;
    bootbox.confirm({
        message: "确认通过该教案",
        callback: function (result) {
            if (result == true)
                ajaxPost(PLAN_MANAGE_URL, submitData, operateSuccess);
        },
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    })
}

function checkBack(plan_idx) {
    var submitData = "CHECKBACK;" + plan_idx;
    bootbox.confirm({
        message: "确认不通过该教案",
        callback: function (result) {
            if (result == true)
                ajaxPost(PLAN_MANAGE_URL, submitData, operateSuccess);
        },
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    })
}