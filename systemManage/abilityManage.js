ABILITY_MANAGE_URL = "systemManage/abilityManage.ashx";
ABILITY_TABLE_ID = "dataTable";

$(function () {
    var colunms = initColunm();
    BSTable(ABILITY_TABLE_ID, ABILITY_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: '编号', field: 'ability_code', align: 'center', },
        { title: '名称', field: 'ability_name', align: 'center', },
        { title: '标题', field: 'ability_title', align: 'center', },
    ];
};

function btnSearchOnClick() {
    refresh(ABILITY_TABLE_ID, ABILITY_MANAGE_URL);
}

function btnResetOnClick() {
    $("input[name='search']").val("");
    refresh(ABILITY_TABLE_ID, ABILITY_MANAGE_URL);
}
