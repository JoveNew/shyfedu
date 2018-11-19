NEWS_MANAGE_URL = "homePage/newsDetail.ashx";
NEWS_TABLE_ID = "dataTable";
NEWS_MODAL_ID = "DetailModal";

$(function () {
    var news_idx= cookie.get("news_idx");
    viewDetails(news_idx);
});

function initModal() {
    $('#' + NEWS_MODAL_ID).modal({
        keyboard: false
    });
}; 

function viewDetails(news_idx) {
    var data = "LOAD_INFO;" + news_idx;       //设置ajaxpost请求字符串
    //将SingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(NEWS_MANAGE_URL, data, singleDataBind);     //单条数据绑定 
};

function singleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    document.getElementById("newsTitle").innerText= obj.news_title;
    document.getElementById("newsDay").innerText = obj.news_day;
    document.getElementById("newsContent").innerText = obj.news_content;
}
