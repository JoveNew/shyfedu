NEWS_URL = "informationManage/newsEdit.ashx";

$(function () {
    news_idx = cookie.get("news_idx");
    if (news_idx != 0)
        getData(news_idx);
})

function getData(news_idx) {
    var submitData = "LOAD_INFO;" + news_idx;
    ajaxPost(NEWS_URL, submitData, getShow);
}

function getShow(result) {
    var obj = eval(result)[0];
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        }
    }
}

function getContent() {
    var news_title = $("#news_title").val();
    var news_content = $("#news_content").val();
    var submitObj = new Object();
    if (news_content != "" || news_title != "") {
        submitObj.news_title = news_title;
        submitObj.news_content = news_content;
    }
    submitObj = JSON.stringify(submitObj);
    return submitObj;
}

function btnSave() {
    var submitData = "";
    if (news_idx != 0)
        submitData = "UPDATE;" + news_idx + ";" + getContent();
    else
        submitData = "INSERT;" + getContent();
    ajaxPost(NEWS_URL, submitData, operateSuccess);
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
    cookie.set("path", "informationManage.newsManage");
    window.location.href = "./framepage.html";
}