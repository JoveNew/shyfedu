//@ sourceURL=roomBook.js
ROOM_BOOK_MANAGE_URL = "thingMANAGE/roomBookManage.ashx";
ROOM_TABLE_ID = "dataTable";

$(function () {
    var colunms = initColumn();
    BSTable(ROOM_TABLE_ID, ROOM_BOOK_MANAGE_URL, colunms);
    ajaxPost("ashx/getSelectList.ashx", "getAcademyList", academySelectBind);    //动态获取校区下拉框
});

function initColumn() {
    return [
        { title: 'ID', field: 'book_idx', align: 'center', visible: false,},
        { title: '教室编号', field: 'room_code', align: 'center', },
        { title: '所在校区', field: 'academy_name', align: 'center', },
        { title: '申请日期', field: 'book_day', align: 'center', },
        { title: '开始时间', field: 'book_start_time', align: 'center', },
        { title: '结束时间', field: 'book_end_time', align: 'center', },
        { title: '申请老师', field: 'teacher_name', align: 'center', },
        { title: '提交申请时间', field: 'apply_time', align: 'center', },
        {
            title: '审核状态', field: 'book_status', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                switch (value) {
                    case "0":
                        return "待审核";
                        break;
                    case "1":
                        return "已通过";
                        break;
                    case "2":
                        return "已拒绝";
                        break;
                }
            }
        },
        { title: '审核时间', field: 'check_time', align: 'center', },
        {
            title: '操作', field: 'room_idx', align: 'center',
            formatter: function (value, row, index) {    //自定义显示可以写标签
                if (row.book_status == 0) {
                    return '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.book_idx + '\',\'' + "agree" + '\')">接受申请</button >&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.book_idx + '\',\'' + "reject" + '\')">拒绝申请</button >';
                }                
            }
        }
    ];
};

//操作列三个按键的点击函数
function optBtnOnClick(book_idx, opt) {
    switch (opt) {
        case "agree":
            applyAgree(book_idx);
            break;
        case "reject":
            applyReject(book_idx);
            break;
    }
};

// 同意申请
function applyAgree(book_idx) {
    var submitData = "AGREE;" + book_idx;
    ajaxPost(ROOM_BOOK_MANAGE_URL, submitData, operateSuccess);
}
// 拒绝申请
function applyReject(book_idx) {
    var submitData = "REJECT;" + book_idx;
    ajaxPost(ROOM_BOOK_MANAGE_URL, submitData, operateSuccess);
}

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(ROOM_TABLE_ID, ROOM_BOOK_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");      //将所有name=search的控件置空
    refresh(ROOM_TABLE_ID, ROOM_BOOK_MANAGE_URL);     //刷新table
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    var resultMessage = result === "0" ? "操作失败" : result;
    bootbox.alert({
        message: resultMessage,
    });
    refresh(ROOM_TABLE_ID, ROOM_BOOK_MANAGE_URL);
}

//校区下拉框绑定
function academySelectBind(data) {
    var optionString = "";
    var academys = eval(data);      //将返回的json字符串实例化
    academys.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.academy_code + "'\>" + item.academy_name + "</option>"; //动态添加数据
    })
    $("#search_academy_code").append(optionString);     //为搜索框中的校区select控件添加数据
}
