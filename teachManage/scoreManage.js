SCORE_MANAGE_URL = "teachManage/scoreManage.ashx";
SCORE_TABLE_ID = "dataTable";
SCORE_MODAL_ID = "DetailModal";
var subject_idx = cookie.get("subject_idx");
var teacher_idx = cookie.get("account_link_idx"); 
var ability = cookie.get("scoreManage");
var datas = new Array();
datas = ability.split(",");

$(function () {
    var colunms = initColunm();
    $("#subject_idx").val(subject_idx);
    $("#study_score_teacher_idx").val(teacher_idx);
    BSTable(SCORE_TABLE_ID, SCORE_MANAGE_URL, colunms);
});

function initColunm() {
    return [
        { title: 'ID', field: 'study_idx', align: 'center', visible: false },
        { title: '学生', field: 'student_name', align: 'center', },
        { title: '课程', field: 'subject_name', align: 'center', },
        { title: '评分老师', field: 'teacher_name', align: 'center', },
        { title: '平时成绩', field: 'study_common_score', align: 'center', },
        { title: '期中成绩', field: 'study_middle_score', align: 'center', },
        { title: '期末成绩', field: 'study_terminal_score', align: 'center', },
        { title: '学期总评', field: 'study_term_score', align: 'center', },
        { title: '学年总评', field: 'study_total_score', align: 'center', },
        { title: '创建时间', field: 'study_create', align: 'center', visible: false },
        { title: '更新时间', field: 'study_update', align: 'center', visible: false },
        {
            title: '操作', field: 'study_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "score")
                        return '<button type="button" class="btn btn-default btn-sm" onclick="takeScore(' + row.study_idx + ')">评分';
                }
            }
        }
    ];
};

function btnSearchOnClick() {
    refresh(SCORE_TABLE_ID, SCORE_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("select[name='search']").val("");
    refresh(SCORE_TABLE_ID, SCORE_MANAGE_URL);
}

function initModal() {
    $('#' + SCORE_MODAL_ID).modal({
        keyboard: false
    });
}; 

function takeScore(study_idx) {
    initModal();
    var data = "LOAD_INFO;" + study_idx;       //设置ajaxpost请求字符串

    //将SingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(SCORE_MANAGE_URL, data, singleDataBind);     //单条数据绑定
}

function btnSaveOnClick() {
    var study_idx = $("#study_idx").val();
    var inputData = getModalVal(SCORE_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    submitData = "UPDATE;" + study_idx + ";" + inputData;
    ajaxPost(SCORE_MANAGE_URL, submitData, operateSuccess);

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
    $("#" + SCORE_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(SCORE_TABLE_ID, SCORE_MANAGE_URL);
}

function btnBackOnClick() {
    cookie.set("path", "teachManage.subjectManage");
    window.location.href = "./framepage.html";
}