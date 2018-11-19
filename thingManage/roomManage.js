//@ sourceURL=roomManage.js
ROOM_MANAGE_URL = "thingMANAGE/roomManage.ashx";
ROOM_TABLE_ID = "dataTable";
ROOM_MODAL_ID = "detailModal";
BOOK_MODAL_ID = "bookModal";

$(function () {
    var colunms = initColumn();
    BSTable(ROOM_TABLE_ID, ROOM_MANAGE_URL, colunms);
    ajaxPost("ashx/getSelectList.ashx", "getAcademyList", academySelectBind);    //动态获取课程下拉
    bookStartTimeSelectInit();          //初始化预约期时间下拉框
    timePickerInit();

    var ability = cookie.get("roomManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = "";
        temp += '<button type="button" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">新增</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);
    }
});

function initColumn() {
    return [
        { title: 'ID', field: 'room_idx', align: 'center', visible: false,},
        { title: '教室编号', field: 'room_code', align: 'center', },
        { title: '教室名', field: 'room_name', align: 'center', },
        {
            title: '所在校区', field: 'academy_name', align: 'center',
        },
        {
            title: '教室状态', field: 'room_type', align: 'center',
            formatter: function (value, row, index) {
                //自定义显示可以写标签
                var str = value == "0" ? "可预约" : "不可预约";
                return str;
            }
        },
        { title: '创建时间', field: 'room_create', align: 'center', visible: false,},
        { title: '更新时间', field: 'room_update', align: 'center', visible: false,},
        {
            title: '操作', field: 'room_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var ability = cookie.get("roomManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = "";
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "update") {
                        btnStr += ' <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.room_idx + '\',\'' + "edit" + '\')">编辑</button>&nbsp&nbsp';
                    }
                    else if (datas[i] == "book" && row.room_type === "0")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "bookRoomBtnOnClick(\'' + row.room_idx + '\',\'' + row.room_code + '\',\'' + row.academy_code + '\',\'' + row.room_type + '\')">预约</button>&nbsp&nbsp';
                    else if (datas[i] == "delete")
                        btnStr += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.room_idx + '\',\'' + "delete" + '\')" > 删除</button>&nbsp&nbsp';
                }
                return btnStr;
            },
        }
    ];
};

//调出模态框
function initModal(modalId = ROOM_MODAL_ID) {
    $('#' + modalId).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(room_idx, opt) {
    switch (opt) {
        case "edit":
            editDetails(room_idx);
            break;
        case "delete":
            deleteRoom(room_idx);
            break;
        case "book":
            bookRoom(room_idx);
            break;
    }
};

//教室预约
function bookRoomBtnOnClick(room_idx, room_code, academy_code, room_type) {
    if (room_type === "1") {
        alert("该教室不可预约！")
    }
    else {
        initModal(BOOK_MODAL_ID);
        var data = "LOAD_INFO;" + room_idx;     //设置ajaxpost请求字符串
        ajaxPost(ROOM_MANAGE_URL, data, function () {
            $("#book_room_idx").val(room_idx);
            $("#book_room_code").val(room_code);
            $("#book_academy_code").val(academy_code);
        });
    }
}

//预约模态框中预约按钮
function btnBookOnClick() {
    var input = getBookModalVal(BOOK_MODAL_ID);
    var submitData = "BOOK;" + $("#book_room_idx").val() + ";" + input;
    ajaxPost(ROOM_MANAGE_URL, submitData, operateSuccess);
    $(BOOK_MODAL_ID).hide();
}

//查看详细
function viewDetails(room_idx) {
    initModal();                               //调出模态框
    var data = "LOAD_INFO;" + room_idx;     //设置ajaxpost请求字符串

    //将tablecontrol.js中的singleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(ROOM_MANAGE_URL, data, singleDataBind);

    $("#btnSave").css('display', 'none');    //将保存按钮隐去
    setInputEditable(ROOM_MODAL_ID, true)     //将input设为只读
}

//详情编辑
function editDetails(room_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + room_idx;       //设置ajaxpost请求字符串
    ajaxPost(ROOM_MANAGE_URL, data, roomSingleDataBind);
    $("#btnSave").css('display', 'inline');
    setInputEditable(ROOM_MODAL_ID, false);
}

//删除函数
function deleteRoom(room_idx) {
    var data = "DELETE;" + room_idx;         //设置ajaxpost请求字符串
    bootbox.setDefaults({
        locale: "zh_CN",
        backdrop: true,
        size: 'small',
    });
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(ROOM_MANAGE_URL, data, operateSuccess)
        },
    })
};

//新增数据
function btnInsertOnClick() {
    initModal();     //调出模态框
    $("input").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(ROOM_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var room_idx = $("#room_idx").val();
    var inputData = getModalVal(ROOM_MODAL_ID);    //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (room_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        submitData = "INSERT;" + inputData;
    }
    else {
        submitData = "UPDATE;" + room_idx + ";" + inputData;
    }
    ajaxPost(ROOM_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(ROOM_TABLE_ID, ROOM_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");      //将所有name=search的控件置空
    refresh(ROOM_TABLE_ID, ROOM_MANAGE_URL);     //刷新table
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    var resultMessage = result === "0" ? "操作失败" : result;
    bootbox.alert({
        message: resultMessage,
    });
    $("#" + ROOM_MODAL_ID).modal('hide');      //操作成功后隐藏模态框,主要针对保存成功的情况
    refresh(ROOM_TABLE_ID, ROOM_MANAGE_URL);
}

//校区下拉框绑定
function academySelectBind(data) {
    var optionString = "";
    var academys = eval(data);      //将返回的json字符串实例化
    academys.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.academy_code + "'\>" + item.academy_name + "</option>"; //动态添加数据
    })
    $("#academy_code").append(optionString);           // 为详情模态框中的校区select控件添加数据 
    $("#search_academy_code").append(optionString);     //为搜索框中的校区select控件添加数据
    $("#book_academy_code").append(optionString);     //为预约模态框中的校区select控件添加数据
}

//教室单条信息绑定
function roomSingleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                  //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {          //若以对象名为id的控件存在，则进行绑定
            $("#" + attriName).val(obj[attriName]);     //适用于input和以value值绑定的select
        }
    };
};

//初始化预约起始时间下拉框
function bookStartTimeSelectInit() {
    var optionString = "";
    for (var i = 1; i < 11; i++) {
        optionString += "<option value=\'" + i + "'\>" + i + "</option>"; //动态添加数据
    }
    $("#book_start_time").append(optionString);           // 为模态框中的校区select控件添加数据 
}

//预约终止时间下拉框响应函数
function endTimeChange(startTime) {
    var optionString = "";
    for (var i = startTime; i < 11; i++) {
        optionString += "<option value=\'" + i + "'\>" + i + "</option>"; //动态添加数据
    }
    $("#book_end_time").empty();                        //先清空之前的option
    $("#book_end_time").append(optionString);           // 为模态框中的校区select控件添加数据 
}

function timePickerInit() {
    $("#book_day").datetimepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',//选择语言，前提是该语言已导入
        todayBtn: true,//是否在底部显示“今天”按钮
        autoclose: true,//当选择一个日期之后是否立即关闭此日期时间选择器
        startView: 2,  //点开插件后显示的界面。0、小时1、天2、月3、年4、十年，默认值2
        minView: 2,   //插件可以精确到那个时间，比如2的话就只能选择到天，不能选择小时了
        forceParse: true,//当选择器关闭的时候，是否强制解析输入框中的值。也就是说，当用户在输入框中输入了不正确的日期，选择器将会尽量解析输入的值，并将解析后的正确值按照给定的格式format设置到输入框中
    });
}

function getBookModalVal(modalId) {
    var inputData = "";
    $("#" + modalId + " [name='bookData']").each(function () {
        inputData += $(this).val() + ",";
    })
    return inputData;
};
