ROLE_MANAGE_URL = "systemManage/roleManage.ashx";
ROLE_TABLE_ID = "dataTable";
ROLE_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    BSTable(ROLE_TABLE_ID, ROLE_MANAGE_URL, colunms);
    ajaxPost(ROLE_MANAGE_URL, "ROLE_SELECT", getRoleSelect);  //获取下拉框
    ajaxPost(ROLE_MANAGE_URL, "ABILITY_SELECT", getAbilitySelect);
});

function initColunm() {
    return [
        { title: '角色', field: 'role_name', align: 'center', },
        { title: '权限', field: 'ability_title', align: 'center', },
        {
            title: '操作', field: 'role_ability_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                return '<button type="button" class="btn btn-default" onclick="deleteList(\'' + row.role_type + ',' + row.ability_code+'\')">删除';
            }
        }
    ];
};

function initModal() {
    $('#' + ROLE_MODAL_ID).modal({
        keyboard: false
    });
}; 

function deleteList(role_ability) {
    var data = "DELETE;" + role_ability;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(ROLE_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true,
        locale: "zh_CN"
    })
};

function btnSearchOnClick() {
    refresh(ROLE_TABLE_ID, ROLE_MANAGE_URL);
}

function btnResetOnClick() {
    $("[name='search']").val("");
    refresh(ROLE_TABLE_ID, ROLE_MANAGE_URL);
}

function btnInsertOnClick() {
    initModal();      //调出模态框
    $("[name='submitData']").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(ROLE_MODAL_ID, false);
}

function btnSaveOnClick() {
    var inputData = getModalVal(ROLE_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "INSERT;" + inputData + ";";
    ajaxPost(ROLE_MANAGE_URL, submitData, operateSuccess);
};

function operateSuccess(result) {
    bootbox.setDefaults({
        size: 'small',
        backdrop: true,
        locale: "zh_CN"
    });
    var operateResult = result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: operateResult
    });
    $("#" + ROLE_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(ROLE_TABLE_ID, ROLE_MANAGE_URL);
}

function getRoleSelect(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.role_type + ">" + datas.role_name + "</option>";
    }
    $("#role_type").append(temp);
    $("[name='search']").append(temp);
}

function getAbilitySelect(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.ability_code + ">" + datas.ability_title + "</option>"; 
    }
    $("#ability_code").append(temp);
}