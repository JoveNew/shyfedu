LESSON_MANAGE_URL = "teachManage/lessonManage.ashx";
LESSON_TABLE_ID = "dataTable";
LESSON_MODAL_ID = "DetailModal";

$(function () {
    var colunms = initColunm();
    var subject_idx = cookie.get("subject_idx");
    $("#subject_idx").val(subject_idx);
    BSTable(LESSON_TABLE_ID, LESSON_MANAGE_URL, colunms);
    loadSelect("subject_idx"); //载入下拉框数据
    loadSelect("teacher_idx");
    loadSelect("lesson_sequence");
    var ability = cookie.get("lessonManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp = '<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type ="button" class="btn btn-default" onclick="btnResetOnClick()"> 重置</button >';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert") {
                temp += '<button type="button" class="btn btn-default" onclick="btnInsertOnClick()">新增</button>';
            }
        }
        temp += '<button type="button" class="btn btn-default" onclick="btnBackOnClick()">返回</button>';
        $("#toolBar").append(temp);
    }
    cookie.del("subject_idx");
});

function initColunm() {
    return [
        { title: 'ID', field: 'lesson_idx', align: 'center', visible: false,  },
        { title: '课时名称', field: 'lesson_name', align: 'center', visible: false,  },
        { title: '课程名称', field: 'subject_name', align: 'center', },
        { title: '教师', field: 'teacher_name', align: 'center', },
        { title: '周次', field: 'lesson_sequence', align: 'center', },
        { title: '创建时间', field: 'lesson_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'lesson_update', align: 'center', visible: false, },
        {
            title: '操作', field: 'lesson_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var ability = cookie.get("lessonManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.lesson_idx + '\',\'' + "detail" + '\')">查看 '; 
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "update")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.lesson_idx + '\',\'' + "edit" + '\')"> 编辑 ';
                    else if (datas[i] == "homework")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.lesson_idx + '\',\'' + "homework" + '\')"> 作业 ';
                    else if (datas[i] == "delete")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.lesson_idx + '\',\'' + "delete" + '\')" > 删除 ';
                }
                return btnStr;
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + LESSON_MODAL_ID).modal({
        keyboard: false
    });
}; 

//操作列三个按键的点击函数
function optBtnOnClick(lesson_idx, opt) {
    switch (opt) {
        case "detail":
            viewDetails(lesson_idx);
            break;
        case "edit":
            editDetails(lesson_idx);
            break;
        case "delete":
            deleteLesson(lesson_idx);
            break;
        case "homework":
            gotoHomework(lesson_idx);
            break;
    }
};

//查看详细
function viewDetails(lesson_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + lesson_idx;       //设置ajaxpost请求字符串

    //将tablecontrol.js中的singleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(LESSON_MANAGE_URL, data, lessonSingleDataBind);

    $("#btnSave").css('display', 'none');     //将保存按钮隐去
    $("select").attr('disabled', true);
    setInputEditable(LESSON_MODAL_ID, true);  //将input设为只读
};

//详情编辑
function editDetails(lesson_idx) {
    initModal();                    //调出模态框
    var data = "LOAD_INFO;" + lesson_idx;        //设置ajaxpost请求字符串
    ajaxPost(LESSON_MANAGE_URL, data, lessonSingleDataBind);
    $("#btnSave").css('display', 'inline');
    $("select").attr('disabled', false);
    setInputEditable(LESSON_MODAL_ID, false);
};

function deleteLesson(lesson_idx) {
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true) {
                var data = "DELETE;" + lesson_idx;            //设置ajaxpost请求字符串
                ajaxPost(LESSON_MANAGE_URL, data, operateSuccess);
            }
        },
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
};


//新增数据
function btnInsertOnClick() {
    initModal();      //调出模态框
    $("[name='submitData']").val("");
    $("select [name='submitData']").val("");
    $("#btnSave").css('display', 'inline');
    setInputEditable(LESSON_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var lesson_idx = $("#lesson_idx").val();
    var inputData = getLessonModalVal(LESSON_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (lesson_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
    {
        submitData = "INSERT;" + inputData;
    }
    else {
        submitData = "UPDATE;" + lesson_idx + ";" + inputData;
    }
    ajaxPost(LESSON_MANAGE_URL, submitData, operateSuccess);
};

function btnSearchOnClick() {
    refresh(LESSON_TABLE_ID, LESSON_MANAGE_URL);
}

function btnResetOnClick() {
    $(".change").val("");
    refresh(LESSON_TABLE_ID, LESSON_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    bootbox.setDefaults({   //为bootbox.alert增加默认样式
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
    var operateResult = result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: result
    });
    $("#" + LESSON_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(LESSON_TABLE_ID, LESSON_MANAGE_URL);
}

//区分下拉框
function loadSelect(data) {
    switch (data) {
        case 'subject_idx':
            ajaxPost(LESSON_MANAGE_URL, data, getSubjectList);
            break;
        case 'teacher_idx':
            ajaxPost(LESSON_MANAGE_URL, data, getTeacherList);
            break;
        case 'lesson_sequence':
            getSequenceList();
            break;
    }
}

//下拉框代码拼接
function getSubjectList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.subject_idx + ">" + datas.subject_name + "</option>";
    }
    $("#subject_idx").append(temp);
}

function getTeacherList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.teacher_idx + ">" + datas.teacher_name + "</option>";
    }
    $("#teacher_idx").append(temp);
}

function getSequenceList()
{
    var temp = "";
    for (var i = 1; i < 11; i++)
    {
        temp += "<option value=" + i + ">" + i + "</option>";
    }
    $("#lesson_sequence").append(temp);
}

function lessonSingleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                    //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        };
    };
};

function getLessonModalVal(modalId) {
    var inputData = "";
    $("#" + modalId + " [name='submitData']").each(function () {
        inputData += $(this).val() + ",";
    })
    if (new RegExp("正常").test(inputData) == true)
        inputData = inputData.replace('正常', '0');
    else if (new RegExp("异常").test(inputData) == true)
        inputData = inputData.replace('异常', '1');
    return inputData;
};

function btnBackOnClick() {
    cookie.set("path", "teachManage.subjectManage");
    window.location.href = "./framepage.html";
}

function gotoHomework(lesson_idx)
{
    cookie.set("lesson_idx", lesson_idx);
    cookie.set("path", "teachManage.homeworkManage");
    window.location.href = "./framepage.html";    
}