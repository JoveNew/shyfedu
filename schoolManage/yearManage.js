YEAR_MANAGE_URL = "schoolManage/yearManage.ashx";
YEAR_MODAL_ID = "DetailModal";
YEAR_TABLE_ID = "dataTable";

$(function () {
    var colunms = initColunm();
    BSTable(YEAR_TABLE_ID, YEAR_MANAGE_URL, colunms);
    getSelect();
});

function initColunm() {
    return [
        { title: '学期编号', field: 'year_code', align: 'center', },
        { title: '学期名称', field: 'year_name', align: 'center', },
        {
            title: '状态', field: 'year_status', align: 'center',
            formatter: function (value, row, index) {
                if (row.year_status == "C")
                    return '<label style="text-align: center; ">当前学期</label>';
                else if (row.year_status == "N")
                    return '<label style="text-align: center; ">初始学期</label>';
                else if (row.year_status == "F")
                    return '<label style="text-align: center; ">结束学期</label>';
            }
        },
        {
            title: '操作', field: 'year_code', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var btnStr = '<button type="button" class="btn btn-default" onclick="gotoTotalClassSchedule(\'' + row.year_code + '\')">班级总课表';
                btnStr += '<button type="button" class="btn btn-default" onclick="gotoTotalTeacherSchedule(\'' + row.year_code + '\')">教师总课表';
                btnStr += '<button type="button" class="btn btn-default" onclick="gotoClassSchedule(\'' + row.year_code + '\')">班级课表';
                btnStr += '<button type="button" class="btn btn-default" onclick="gotoTeacherSchedule(\'' + row.year_code + '\')">教师课表';
                if (row.year_status == "N" || row.year_status == "C") {
                    btnStr += '<button type="button" class="btn btn-default" onclick="gotoScheduleManage(\'' + row.year_code + '\')">课程排课';
                    btnStr += '<button type="button" class="btn btn-default" onclick="buildSubject(\'' + row.year_code + '\')">生成课程';
                }
                if (row.year_status == "C") {
                    
                    btnStr += '<button type="button" class="btn btn-default" onclick="setFinish(\'' + row.year_code + '\')">设为结束学期';
                }
                if (row.year_status == "N") {
                    btnStr += '<button type="button" class="btn btn-default" onclick="setCurrent(\'' + row.year_code + '\')">设为当前学期';
                }
                return btnStr;
            }
        }
    ];
};

function btnSearchOnClick() {
    refresh(YEAR_TABLE_ID, YEAR_MANAGE_URL);
}

function btnResetOnClick() {
    $("input[name='search']").val("");
    refresh(YEAR_TABLE_ID, YEAR_MANAGE_URL);
}


function gotoClassSchedule(data) {
    cookie.set("year_code", data);
    cookie.set("path", "teachManage.scheduleClassTable")
    window.location.href = "../framepage.html";
}

function gotoTeacherSchedule(data) {
    cookie.set("year_code", data);
    cookie.set("path", "teachManage.scheduleTeacherTable")
    window.location.href = "../framepage.html";
}

function gotoTotalClassSchedule(data) {
    cookie.set("year_code", data);
    cookie.set("path", "teachManage.totalClassTable")
    window.location.href = "../framepage.html";
}

function gotoTotalTeacherSchedule(data) {
    cookie.set("year_code", data);
    cookie.set("path", "teachManage.totalTeacherTable")
    window.location.href = "../framepage.html";
}

function gotoScheduleManage(data) {
    cookie.set("year_code", data);
    cookie.set("path", "teachManage.scheduleManage")
    window.location.href = "../framepage.html";
}

function buildSubject(data) {
    data = "BUILD;" + data;
    bootbox.setDefaults({   //为bootbox.alert增加默认样式
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
    bootbox.confirm({
        message: "确认提交？",
        callback: function (result) {
            if (result == true)
                ajaxPost(YEAR_MANAGE_URL, data, operateSuccess)
        },
    })
}

function getSelect() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear(); 
    var currentMonth = currentDate.getMonth();
    var temp = ""; 
    for (var i = 3; i >= 0; i--) {  //获取前三年与今年
        var num = currentYear - i;
        temp += "<option value=" + num + ">" + num + "</option>";
    }
    for (var j = 1; j < 4; j++) {  //获取后三年
        var num = currentYear + j;
        temp += "<option value=" + num + ">" + num + "</option>";
    }
    $("#year").append(temp);
    if (currentMonth < 9) {
        $("#year").val(currentYear - 1);
    }
    else
        $("#year").val(currentYear);
}

//调出模态框
function initModal() {
    $('#' + YEAR_MODAL_ID).modal({
        keyboard: false
    });
};

function btnInsertOnClick() {
    initModal();
}

function btnSaveOnClick() {
    var year = $("#year").val();
    var term = $("#term").val();
    var term_name = $("#term").find("option:selected").text();
    var code = "Y" + year + term;
    var name = year + "年" + term_name ;
    var data = "INSERT;" + code + "," + name + ","+"N";
    ajaxPost(YEAR_MANAGE_URL, data, operateSuccess);
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
    $("#" + YEAR_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(YEAR_TABLE_ID, YEAR_MANAGE_URL);
}
//设为当前学期
function setCurrent(year_code) {
    var submintData = "CURRENT;" + year_code;
    ajaxPost(YEAR_MANAGE_URL, submintData, operateSuccess);
}
//设为结束学期
function setFinish(year_code) {
    var submintData = "FINISH;" + year_code;
    ajaxPost(YEAR_MANAGE_URL, submintData, operateSuccess);
}