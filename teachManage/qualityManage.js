QUALITY_MANAGE_URL = "teachManage/qualityManage.ashx";

$(function () {
    plan_idx = cookie.get("plan_idx");
    subject_idx = cookie.get("subject_idx");
    judge = cookie.get("judgeFunction");
    getData();
    if (judge == "1")
        banEdit(false);
    else
        banEdit(true);
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

function getData() {
    var submitData = "LOAD_INFO;" + plan_idx + "," + subject_idx;
    ajaxPost(QUALITY_MANAGE_URL, submitData, getShow);
}

function getShow(result) {
    var obj = JSON.parse(result)[0];
    var data = "";
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        }
        else if (attriName == "plan_file")         
            data = obj[attriName];
    }
    if (data != "") {
        data = JSON.parse(data);
        for (var attriName in data) {
            if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
                $("#" + attriName).val(data[attriName]);
            };
        }
    }
    var excellentPer = ($("#levelA").val() * 1 + $("#levelB").val() * 1) * 100 / ($("#studentNum").val() * 1);
    if ($("#studentNum").val() != "0") {
        excellentPer = excellentPer.toFixed(1).toString() +"%";
        $("#excellentPer").val(excellentPer);
    }
    $(".keepReadOnly").attr("readonly", "readonly");
    var yearStr = "<p>" + obj.year_name + "</p>";
    $("#year_name").html(yearStr);
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

function btnSaveOnClick() {
    var submitData = "UPDATE;" + plan_idx + ";" + getJson();
    ajaxPost(QUALITY_MANAGE_URL, submitData, operateSuccess);
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
    setTimeout(function () {
        btnBackOnClick();
    }, 2 * 1000);
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.planManage");
    window.location.href = "./framepage.html";
}