MAJOR_TRAIN_URL = "schoolManage/majorTrain.ashx";
MAJOR_TRAIN_TABLE_ID = "dataTable";
MAJOR_TRAIN_MODAL_ID = "DetailModal";
major_code = cookie.get("major_code");
major_name = cookie.get("major_name");

$(function () {
    $("input[name='search']").val(major_code);
    var colunms = initColunm();
    BSTable(MAJOR_TRAIN_TABLE_ID, MAJOR_TRAIN_URL, colunms);
    getTrainGrade();
    getSubjectType();
    getMajor();
    cookie.del("major_code");
    cookie.del("major_name");
    judgeCookie();
});

function initColunm() {
    return [
        { title: '进程ID', field: 'train_idx', align: 'center', visible: false, },
        { title: '入学年份', field: 'train_grade', align: 'center', },
        { title: '课程', field: 'subject_type_name', align: 'center', },
        { title: '学期一', field: 'term1', align: 'center',},
        { title: '学期二', field: 'term2', align: 'center', },
        { title: '学期三', field: 'term3', align: 'center', },
        { title: '学期四', field: 'term4', align: 'center', },
        { title: '学期五', field: 'term5', align: 'center', },
        { title: '学期六', field: 'term6', align: 'center', },
        { title: '总课时', field: 'term_total', align: 'center', },
        { title: '创建时间', field: 'train_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'train_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'major_code', align: 'center',
            formatter: function (value, row, index) {
                return '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.train_idx + '\',\'' + "edit" + '\')"> 编辑</button >&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.train_idx + '\',\'' + "delete" + '\')" > 删除</button > ';
            }
        },
    ];
};

//调出模态框
function initModal() {
    $('#' + MAJOR_TRAIN_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(train_idx, opt) {
    switch (opt) {
        case "edit":
            editDetails(train_idx);
            break;
        case "delete":
            deleteInfo(train_idx);
            break;
    }
};

function btnSearchOnClick() {
    refresh(MAJOR_TRAIN_TABLE_ID, MAJOR_TRAIN_URL);
}

function btnResetOnClick() {
    if (major_code != undefined)
        $("#beginYear").val("");
    else
        $("select[name='search']").val("");
    refresh(MAJOR_TRAIN_TABLE_ID, MAJOR_TRAIN_URL);
}

//新增数据
function btnInsertOnClick() {
    initModal();      //调出模态框
    $("input[name='submitData']").val("");
    $("select[name='submitData']").val("");
    $("#subject_type").trigger("chosen:updated");
    $("#major_code").val(major_code);
    $("#btnSave").css('display', 'inline');
}

function btnBackOnClick() {
    cookie.set("path", "schoolManage.majorManage");
    window.location.href = "./framepage.html";
}

function editDetails(train_idx) {
    initModal();                    //调出模态框
    var data = "LOAD_INFO;" + train_idx;        //设置ajaxpost请求字符串
    ajaxPost(MAJOR_TRAIN_URL, data, singleDataBind);
};

//删除
function deleteInfo(train_idx) {
    var data = "DELETE;" + train_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(MAJOR_TRAIN_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true
    })
};

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
    $("#" + MAJOR_TRAIN_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    refresh(MAJOR_TRAIN_TABLE_ID, MAJOR_TRAIN_URL);
}

function btnSaveOnClick() {
    var train_idx = $("#train_idx").val();
    var inputData = getModalVal(MAJOR_TRAIN_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var total = 0;
    for (var i = 1; i < 7; i++) {
        total += $("#term" + i).val()*1;
    }
    inputData += total*18;
    var submitData = "";
    if (train_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
    {
        submitData = "INSERT;" + inputData;
    }
    else {
        submitData = "UPDATE;" + train_idx + ";" + inputData;
    }
    ajaxPost(MAJOR_TRAIN_URL, submitData, operateSuccess);
};

function getTrainGrade() {
    var date = new Date;
    var year = date.getFullYear(); 
    var tempStr = "";
    for (var i = 5; i > 0; i--) {
        tempStr += "<option value=" + (year - i) + ">" + (year - i) + "</option>";
    }
    tempStr += "<option value=" + year + ">" + year + "</option>";
    for (var i = 1; i < 6; i++) {
        tempStr += "<option value=" + (year + i) + ">" + (year + i) + "</option>";
    }
    $("#train_grade").append(tempStr);
    $("#beginYear").append(tempStr);
}

function getSubjectType() {
    var submitData = "SubjectType;";
    ajaxPost(MAJOR_TRAIN_URL, submitData, function (result) {
        var obj = eval(result);
        for (var i = 0; i < obj.length; i++) {
            tempStr = "<option value=" + obj[i].subject_type + ">[" + obj[i].subject_type + "]" + obj[i].subject_type_name + "</option>";
            $("#subject_type").append(tempStr);
        }
        $("#subject_type").trigger("chosen:updated");
        $("#subject_type").chosen();
    });
}

function getMajor() {
    var submitData = "Major;";
    ajaxPost(MAJOR_TRAIN_URL, submitData, function (result) {
        var obj = eval(result);
        for (var i = 0; i < obj.length; i++) {
            tempStr = "<option value=" + obj[i].major_code + ">" + obj[i].major_name + "</option>";
            $("#majorName").append(tempStr);
        }
    });
}

function judgeCookie() {
    console.log(major_code);
    if (major_code != undefined　) {
        $(".panel-heading").append("<b>" + major_name + "专业进程表</b>");
        $("#majorName").css("display", "none");
        $(".chosen[name='search']").css("display", "none");
    }
    else if (major_code == undefined)
        $(".panel-heading").append("<b>专业进程表</b>");
}