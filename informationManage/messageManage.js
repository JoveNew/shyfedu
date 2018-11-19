MESSAGE_MANAGE_URL = "informationManage/messageManage.ashx";
MESSAGE_TABLE_ID = "dataTable";
MESSAGE_MODAL_ID = "DetailModal";

$(function () {
     
    var role_type= cookie.get("role_type");
    if (role_type == "A") {
        $("#receiveSearch").attr("style", "");
    }
    var colunms = initColunm();
    BSTable(MESSAGE_TABLE_ID, MESSAGE_MANAGE_URL, colunms);
});


function initColunm() 
{
    return [
        { title: 'ID', field: 'message_idx', align: 'center', },
        {   title:'标题',field:'message_title',align:'center',    },
        { title: '发送人', field: 'source_account_name', align: 'center', },
        { title: '接收人', field: 'receive_account_name', align: 'center', },
        {
            title: '类型', field: 'message_type', align: 'center',
            formatter: function (value, row, index) {
                if (row.message_type == 'H') {
                    return '<label style="text-align: center; ">作业提交 </label>';
                }
                else if (row.message_type == 'P') {
                    return '<label style="text-align: center; ">作品提交 </label>';
                }
            }
        },
        { title: '课程', field: 'subject_name', align: 'center', },
        {
            title: '状态', field: 'message_state', align: 'center',
            formatter: function (value, row, index) {
                if (row.message_state == 'R') {
                    return '<label style="text-align: center; ">已读 </label>';
                }
                else if (row.message_state == 'N') {
                    return '<label style="text-align: center; ">未读 </label>';
                }
            }
        },
        { title: '创建时间', field: 'message_create', align: 'center', },
        { title: '更新时间', field: 'message_update', align: 'center', },
        {
            title:'操作',field:'message_idx',align:'center',
            formatter:function (value,row,index)
            {        //自定义显示可以写标签
                var btn = '<button type="button" class="btn btn-default btn-sm" onclick="viewDetails(' + row.message_idx + ')">详情';
                btn += '<button type="button" class="btn btn-default btn-sm" onclick="messageClick(' + row.message_idx + ')">查看';
                return btn;
            }
        }
    ];
};


function initModal()
{
    $('#' + MESSAGE_MODAL_ID).modal({
        keyboard:false
    });
}; 


function viewDetails(message_idx)
{
    initModal();                             //调出模态框
    var data="LOAD_INFO;"+message_idx;       //设置ajaxpost请求字符串

    //将SingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(MESSAGE_MANAGE_URL, data, MessageSingleDataBind);     //单条数据绑定 
    $("#btnSave").css('display','none');     //将保存按钮隐去

    setInputEditable(MESSAGE_MODAL_ID,true);  //将input设为只读
};

function btnSearchOnClick()
{
    refresh(MESSAGE_TABLE_ID,MESSAGE_MANAGE_URL);
}

function btnResetOnClick()
{
    $("input[name='search']").val("");
    $("select[name='search']").val("");
    refresh(MESSAGE_TABLE_ID, MESSAGE_MANAGE_URL);
}

function MessageSingleDataBind(data)
{
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                    //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            if (attriName == "source_account_idx")
                $("#" + attriName).val(obj["source_account_name"]);
            else if (attriName == "receive_account_idx")
                $("#" + attriName).val(obj["receive_account_name"]);
            else if (attriName == "subject_idx")
                $("#" + attriName).val(obj["subject_name"]);
            else
                $("#" + attriName).val(obj[attriName]);
        };
    }; 
}