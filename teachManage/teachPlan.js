TEACHPLAN_URL = "teachManage/teachPlan.ashx";

$(function () {
    plan_idx = cookie.get("plan_idx");
    judge = cookie.get("judgeFunction");
    getData();
    if (judge == "1")
        banEdit(false);
    else
        banEdit(true);
    getTitle(plan_idx);
});

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
    ajaxPost(TEACHPLAN_URL, submitData, titleBind);
}

function titleBind(result) {
    var data = eval(result)[0];
    data = "逸夫职校" + data.major_name + "专业课程学期授课计划"; 
    $("#title").html(data);
}

function getData() {
    var submitData = "LOAD_INFO;" + plan_idx;
    ajaxPost(TEACHPLAN_URL, submitData, getShow);
}

function getShow(result) {
    var obj = eval(result)[0];
    var data = "";
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        }
        else if (attriName=="plan_file")
            data = obj[attriName];
    }
    $("#row1_1").val(obj.subject_name);
    $("#row1_2").val(obj.subject_hour);
    $("#row4_6").val(obj.subject_hour);
    $("#row2_2").val(obj.subject_hour * 18);
    $("#row4_7").val(obj.subject_hour * 18);
    if (data != "") {
        data = JSON.parse(data);
        for (var attriName in data) {
            if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
                $("#" + attriName).val(data[attriName]);
            };
        }
    }
}

function getJson() {
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
    ajaxPost(TEACHPLAN_URL, submitData, operateSuccess);
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

function btnBack() {
    cookie.set("path", "teachManage.planManage");
    window.location.href = "./framepage.html";
}