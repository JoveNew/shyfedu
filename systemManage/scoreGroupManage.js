SCORE_GROUP_MANAGE_URL = "systemManage/scoreGroupManage.ashx";
SCORE_GROUP_TABLE_ID = "dataTable";
SCORE_GROUP_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    ajaxPost(SCORE_GROUP_MANAGE_URL, "account_idx", getAccountList); 
    ajaxPost(SCORE_GROUP_MANAGE_URL, "score_group_code", getGroupList);
    BSTable(SCORE_GROUP_TABLE_ID, SCORE_GROUP_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: 'ID', field: 'score_group_manage_idx', align: 'center', visible: false, },
        { title: '组名', field: 'score_group_name', align: 'center', },
        { title: '用户ID', field: 'account_idx', align: 'center', },
        { title: '用户名', field: 'account_name', align: 'center', },
        { title: '创建时间', field: 'score_group_manage_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'score_group_manage_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'score_group_manage_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                return '<button type="button" class="btn btn-default btn-sm" onclick= "deleteGroup(' + row.score_group_manage_idx + ' )" > 删除';
            }
        }
    ];
};


function initModal() {
    $('#' + SCORE_GROUP_MODAL_ID).modal({
        keyboard: false
    });
}; 

function deleteGroup(score_group_manage_idx) {
    var data = "DELETE;" + score_group_manage_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(SCORE_GROUP_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true,
        locale: "zh_CN"
    })
};

function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(SCORE_GROUP_MODAL_ID, false);
}


function btnSaveOnClick() {
    var score_group_manage_idx = $("#score_group_manage_idx").val();
    var inputData = getModalVal(SCORE_GROUP_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    console.log(inputData);
    if (inputData == "")
        bootbox.alert({
            message: "还有数据未选择！",
            size: 'small',
            backdrop: true,
            locale: "zh_CN"
        });
    else {
        var submitData = "";
        if (score_group_manage_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        {
            submitData = "INSERT;" + inputData + ";";
        }
        else {
            submitData = "UPDATE;" + score_group_manage_idx + ";" + inputData + ";";
        }
        ajaxPost(SCORE_GROUP_MANAGE_URL, submitData, operateSuccess);
    }
};

function btnSearchOnClick() {
    refresh(SCORE_GROUP_TABLE_ID, SCORE_GROUP_MANAGE_URL);
}

function btnResetOnClick() {
    $("input[name='search']").val("");
    refresh(SCORE_GROUP_TABLE_ID, SCORE_GROUP_MANAGE_URL);
}

function operateSuccess(result) {
    bootbox.setDefaults({
        size: 'small',
        backdrop: true,
        locale: "zh_CN"
    });
    var operateResult = result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: result
    });
    $("#" + SCORE_GROUP_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(SCORE_GROUP_TABLE_ID, SCORE_GROUP_MANAGE_URL);
}

function getAccountList(data)
{
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.account_idx + ">" + datas.account_name + "</option>";
    }
    $("#account_idx").append(temp);
}

function getGroupList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.score_group_code + ">" + datas.score_group_name + "</option>";
    }
    $("#score_group_code").append(temp);
}