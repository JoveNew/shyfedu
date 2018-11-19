NEWS_MANAGE_URL = "informationManage/newsManage.ashx";
NEWS_TABLE_ID = "dataTable";
NEWS_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    BSTable(NEWS_TABLE_ID, NEWS_MANAGE_URL, colunms);
    var ability = cookie.get("newsManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = '<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button >' +
                    '<button type="button" class="btn btn-default" onclick="btnResetOnClick()">重置</button>';
        for (var i = 0; i < datas.length; i++) {
             if (datas[i] == "insert")
                 temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">新增</button >';
        }
        $(".form-inline").append(temp);
    }

});


function initColunm() 
{
    return [
        { title: 'ID', field: 'news_idx', align: 'center', },
        { title: '标题', field: 'news_title', align: 'center', },
        {   title:'发布日期',field:'news_day',align:'center',    },
        { title: '类型', field: 'news_type', align: 'center', },
        { title: '创建时间', field: 'news_create', align: 'center', },
        { title: '更新时间', field: 'news_update', align: 'center', },
        {
            title: '操作', field: 'news_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var ability = cookie.get("newsManage");
                var btnStr = '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.news_idx + '\',\'' + "detail" + '\')">查看';;
                if (ability != undefined) {
                    var datas = new Array();
                    datas = ability.split(",");
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i] == "delete")
                            btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.news_idx + '\',\'' + "delete" + '\')"> 删除';
                        else if (datas[i] == "update")
                            btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.news_idx + '\',\'' + "edit" + '\')"> 编辑';
                    }
                }
                return btnStr;
            }
        }
    ];
};

//function initModal()
//{
//    $('#' + NEWS_MODAL_ID).modal({
//        keyboard:false
//    });
//}; 

//操作列三个按键的点击函数
function optBtnOnClick(news_idx, opt)
{
    switch(opt)
    {
        case "detail":
            viewDetails(news_idx);
            break;
        case "edit":
            editDetails(news_idx);
            break;
        case "delete":
            deleteNews(news_idx);
            break;
    }
};

function viewDetails(news_idx)
{
    //initModal();                             //调出模态框
    //var data="LOAD_INFO;"+news_idx;       //设置ajaxpost请求字符串

    ////将SingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    //ajaxPost(NEWS_MANAGE_URL, data, singleDataBind);     //单条数据绑定 
    //$("#btnSave").css('display','none');     //将保存按钮隐去

    //setInputEditable(NEWS_MODAL_ID,true);  //将input设为只读
    cookie.set("news_idx", news_idx);
    cookie.set("path", "homePage.newsDetail");
    window.location.href = "../framepage.html";
};

function editDetails(news_idx)
{
    //initModal();                    //调出模态框
    //var data = "LOAD_INFO;"+news_idx;        //设置ajaxpost请求字符串
    //ajaxPost(NEWS_MANAGE_URL,data, singleDataBind);
   
    //$("#btnSave").css('display','inline');
    //setInputEditable(NEWS_MODAL_ID,false);
    cookie.set("news_idx", news_idx);
    cookie.set("path", "informationManage.newsEdit");
    window.location.href = "../framepage.html";
};

function deleteNews(news_idx)
{
    var data = "DELETE;" + news_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message:"确认删除？",
        callback:function (result){
            if (result == true)
                ajaxPost(NEWS_MANAGE_URL,data,operateSuccess)
        },
        size:'small',
        backdrop:true,
        locale:"zh_CN"
    })
};

function btnInsertOnClick()
{
    //initModal();      //调出模态框
    //$("input").val("");
    //$("#btnSave").css('display','inline');
    //setInputEditable(NEWS_MODAL_ID,false);
    cookie.set("news_idx", 0);
    cookie.set("path", "informationManage.newsEdit");
    window.location.href = "../framepage.html";
}

//function btnSaveOnClick()
//{
//    var news_idx = $("#news_idx").val();
//    var inputData = getModalVal(NEWS_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
//    var submitData = "";
//    if (news_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
//    {
//        submitData = "INSERT;" + inputData + ";";
//    }
//    else
//    {
//        submitData = "UPDATE;" + news_idx + ";" + inputData + ";"; 
//    }
//    ajaxPost(NEWS_MANAGE_URL, submitData, operateSuccess);
//};

function btnSearchOnClick()
{
    refresh(NEWS_TABLE_ID,NEWS_MANAGE_URL);
}

function btnResetOnClick() {
    $("input[name='search']").val("");
    refresh(NEWS_TABLE_ID, NEWS_MANAGE_URL);
}

function operateSuccess (result)
{
    bootbox.setDefaults({
        size:'small',
        backdrop:true,
        locale:"zh_CN"
    });
    var operateResult= result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: operateResult
    });
    $("#" + NEWS_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(NEWS_TABLE_ID,NEWS_MANAGE_URL);
}

