//@ sourceURL=scheduleClassTable.js
SCHEDULE_CLASS_TABLE_URL = "teachMANAGE/scheduleClassTable.ashx";
GET_SELECT_LIST = "ashx/getSelectList.ashx"

$(function () {
    loadSelect("getClassList");
    initClassTable();
});

//查询按钮
function btnSearchOnClick() {
    if ($("#classSearch").val() == "")
    {
        alert("请选择班级！");
    }
    else
    {
        var submitData = "getLessonData;" + $("#classSearch").val() + ";" + cookie.get("year_code");
        cookie.del();
        document.getElementById("classTableHead").innerHTML = $("#classSearch").find("option:selected").text() + "课程表";
        ajaxPost(SCHEDULE_CLASS_TABLE_URL, submitData, lessonDataBind)
    }

}

//重置按钮
function btnResetOnClick() {
    $("#classSearch").val("");
    document.getElementById("classTableHead").innerHTML = "班级课表";
    initClassTable();
}

//初始化课程表表格
function initClassTable() {
    jQuery(function ($) {
        var sth = "<table width='100%' height='450px' style='text-align:center;' border='1'>";
        sth += "<tr style='font-weight:bold'><td></td><td>周一</td><td>周二</td><td>周三</td><td>周四</td><td>周五</td><td>周六</td><td>周日</td></tr>"
        for (var i = 1; i < 11; i++) {
            sth += "<tr>";
            sth += "<td style='width:12.5%'>" + i + "</td>";
            for (var j = 1; j <= 7; j++) {
                var id = i * 10 + j;
                sth += "<td id='" + id + "' style='width:12.5%'></td>";
            }
            sth += "</tr>";
        }
        $('#classTable').html(sth + "</table>");
    });
}

function loadSelect(data) {
    ajaxPost(GET_SELECT_LIST, data, selectBind);
}

//下拉框绑定
function selectBind(data) {
    var obj = eval(data);
    var yearTemp = "";
    var classTemp = "";

    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.year_code) == "string")
            yearTemp += "<option value=" + datas.year_code + ">" + datas.year_name + "</option>";
    }
    $("#yearSearch").append(yearTemp);

    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.class_idx) == "string")
            classTemp += "<option value=" + datas.class_idx + ">" + datas.class_name + "</option>";
    }
    $("#classSearch").append(classTemp);
}

//课程绑定
function lessonDataBind(data) {
    initClassTable();
    if (data != "0") {
        var lessonObjs = eval(data);      //将返回的json字符串实例化
        for (var i = 0; i < lessonObjs.length; i++) {
            var schedule_day = parseInt(lessonObjs[i]["schedule_day"]);
            var schedule_sequence = parseInt(lessonObjs[i]["schedule_sequence"]);
            var subject_type_name = lessonObjs[i]["subject_type_name"];
            var room_name = lessonObjs[i]["room_name"];
            var teacherName = lessonObjs[i]["teacher_name"];
            var locate = schedule_day + (schedule_sequence * 10);
            document.getElementById(locate).innerHTML = subject_type_name + "<br>" + teacherName + "<br>" + room_name;
        }
    }
}

function btnBackOnClick() {
    cookie.set("path", "schoolManage.yearManage");
    window.location.href = "./framepage.html";
}

function btnPrintOnClick() {
    window.print();
}