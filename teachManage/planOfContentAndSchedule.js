POCAS_URL = "teachManage/planOfContentAndSchedule.ashx";

$(function () {
    plan_idx = cookie.get("plan_idx");
    judge = cookie.get("judgeFunction");
    getTable();
    getData();
    if (judge == "1")
        banEdit(false);
    else
        banEdit(true);
    getTitle(plan_idx);
})

function banEdit(isReadOnly) {
    if (isReadOnly) {
        $("[name='submitData']").removeAttr("readonly");
        $("[name='submit']").css("display", "");
    }
    else {
        $("[name='submitData']").attr("readonly", "readonly");
        $("[name='submit']").css("display", "none");
    }
}

function getTitle(plan_idx) {
    var submitData = "TITLE;" + plan_idx;
    ajaxPost(POCAS_URL, submitData, titleBind);
}

function titleBind(result) {
    var data = eval(result)[0];
    data = "逸夫职校" + data.major_name + "专业课程";
    $("#title").html(data);
}

function getData() {
    var submitData = "LOAD_INFO;" + plan_idx;
    ajaxPost(POCAS_URL, submitData, getShow);
}

function getShow(result) {
    var temp1 = "期中专业考试（具体时间待定）";
    $("#row9_2").val(temp1);
    var temp2 = "期末专业考试（具体时间待定）";
    $("#row18_2").val(temp2);
    var obj = eval(result)[0];
    var data = "";
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        }
        else if (attriName=="plan_file")
            data = obj[attriName];
    }
    for (var i = 1; i < 19; i++) {
        $("#row" + i + "_3").val(obj.subject_hour);
    }
    var totalLesson = obj.subject_hour*18;
    $("#totalLesson").val(totalLesson);
    if (data != "") {
        data = JSON.parse(data);
        for (var attriName in data) {
            if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
                $("#" + attriName).val(data[attriName]);
            };
        }
    }
    totalLesson = 0;
    for (var i = 1; i < 19; i++) {
        totalLesson += $("#row" + i + "_3").val() * 1;
    }
    $("#totalLesson").val(totalLesson);
}

function getJson() {
    var totalLesson = 0;
    for (var i = 1; i < 19; i++) {
        totalLesson += $("#row" + i + "_3").val() * 1;
    }
    $("#totalLesson").val(totalLesson);
    var submitData = "{";
    $("[name='submitData']").each(function () {
        if ($(this).val() != "")
            submitData += '"' + $(this).attr("id") + '":"' + $(this).val() + '",';
    })
    submitData = submitData.substring(0, submitData.length - 1) + "}";
    return submitData;
}

function btnSave() {
    var submitData = "UPDATE;" + plan_idx + ";" + getJson();
    ajaxPost(POCAS_URL, submitData, operateSuccess);
}

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
    //推迟页面跳转
    setTimeout(function () {
        btnBack();
    }, 2 * 1000);
}

function getTable() {
    var temp = "";
    for (var i = 1; i < 19; i++) {
        temp += "<tr>\n";
        temp += "<td>" + i + "</td>\n";
        for (var j = 1; j < 7; j++) {
            if (j == 1 || j == 3)
                temp += "<td><input name='submitData' id='row" + i + "_" + j + "'/></td>\n";
            else
                temp += "<td><textarea name='submitData' id='row" + i + "_" + j + "' rows='3'/></td>\n";
        }
        temp += "</tr>\n";
    }
    temp += "<tr>\n<td colspan = '7'>\n<table frame='void' border='1' style='width:100%'>\n<tr>";
    temp += "<td>教研组长签字：</td>\n<td><input name='submitData' id='PCSTeachGroup' /></td>\n";
    temp += "<td>专业处签字：</td>\n<td><input name='submitData' id='PCSArtDepartment' /></td></tr></table></td ></tr >";
    $("#insert").append(temp);
}

function btnBack() {
    cookie.set("path", "teachManage.planManage");
    window.location.href = "./framepage.html";
}