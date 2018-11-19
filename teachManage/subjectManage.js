/*
作者：lixiaowen
创建日期：2018.8.30
文档说明：
1.设备信息管理的JS代码，发送命令和参数，向服务器请求数据，并处理返回的数据。
2.将ASHX文件地址定义成常量。
3.创建初始页面
4.完成表格中三个功能键被触发后的事件
5.为重置按钮添加功能，添加搜索、新增功能

*/

SUBJECT_MANAGE_URL = "teachManage/subjectManage.ashx";
SUBJECT_TABLE_ID = "dataTable";
SUBJECT_MODAL_ID = "DetailModal";

$(function () 
{
    loadSelect("subject_type"); //载入下拉框数据
    loadSelect("teacher_idx");
    loadSelect("room_idx");
    loadSelect("year_code");
    loadSelect("class_idx");
    loadSelect("score_group_code");
    var colunms = initColunm();
    BSTable(SUBJECT_TABLE_ID, SUBJECT_MANAGE_URL, colunms);
    var ability = cookie.get("subjectManage");
    if (ability != undefined) {
        var datas = new Array();
        datas = ability.split(",");
        var temp ='<button type="submit" class="btn btn-default" onclick="btnSearchOnClick()">查询</button>' +
            '<button type="button" class="btn btn-default" onclick="btnResetOnClick()">重置</button>';
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == "insert")
                temp += "<button type='button' class='btn green btn-outline' onclick='btnInsertOnClick()'><i class='fa fa-plus'></i> 新增</button>";
        }
        $("#toolbar").append(temp);
    }
});

function initColunm() 
{
    return [
        { title: 'ID', field: 'subject_idx', align: 'center', visible: false,  },
        { title: '课程编号', field: 'subject_code', align: 'center', visible: false, },
        {   title:'课程名称',field:'subject_name',align:'center',    },
        { title: '课程类型', field: 'subject_type_name', align: 'center', visible: false,    },
        { title: '班级', field: 'class_name', align: 'center', },
        {   title: '修读学期', field: 'year_name', align: 'center',    },
        { title: '教师', field: 'teacher1_name', align: 'center',   },
        { title: '创建时间', field: 'subject_create', align: 'center', visible: false, },
        { title: '更新时间', field: 'subject_update', align: 'center', visible: false, },
        {
            title:'操作',field:'subject_idx',align:'center',
            formatter:function (value,row,index)
			{        //自定义显示可以写标签
                var ability = cookie.get("subjectManage");
                var datas = new Array();
                datas = ability.split(",");
                var btnStr = '<button type="button" class="btn btn-default btn-sm" onclick="optBtnOnClick(\'' + row.subject_idx + '\',\'' + "detail" + '\')">查看'; 
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] == "update")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "edit" + '\')"> 编辑';
                    else if (datas[i] == "lesson")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "lesson" + '\')"> 课时';
                    else if (datas[i] == "courseware")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "courseware" + '\')" > 课件';
                    else if (datas[i] == "project")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "project" + '\')" > 作品';
                    else if (datas[i] == "score")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "score" + '\')" > 成绩';
                    else if (datas[i] == "plan")
                        btnStr += '<button type="button" class="btn btn-default btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "plan" + '\')" > 教案';
                    else if (datas[i] == "delete")
                        btnStr += '<button type="button" class="btn red btn-outline btn-sm" onclick= "optBtnOnClick(\'' + row.subject_idx + '\',\'' + "delete" + '\')" ><i class="fa fa-times"></i> 删除';
                    
                }
                return btnStr;
            }
        }
    ];
};

//调出模态框
function initModal()
{
    $('#' + SUBJECT_MODAL_ID).modal({
        keyboard:false
    });
}; 

//操作列三个按键的点击函数
function optBtnOnClick(subject_idx, opt)
{
    switch(opt)
    {
        case "detail":
            viewDetails(subject_idx);
            break;
        case "edit":
            editDetails(subject_idx);
            break;
        case "delete":
            deleteLesson(subject_idx);
            break;
        case "lesson":
            gotoLesson(subject_idx);
            break;
        case "courseware":
            gotoCoursware(subject_idx);
            break;
        case "project":
            gotoProject(subject_idx);
            break;
        case "score":
            gotoScore(subject_idx);
            break;
        case "plan":
            gotoPlan(subject_idx);
    }
};

//查看详细
function viewDetails(subject_idx)
{
    initModal();                             //调出模态框
    var data="LOAD_INFO;"+subject_idx;       //设置ajaxpost请求字符串

    //将tablecontrol.js中的singleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(SUBJECT_MANAGE_URL,data,singleDataBind);

    $("#btnSave").css('display','none');     //将保存按钮隐去
    $("select [name='submitData']").attr('disabled',true);
    setInputEditable(SUBJECT_MODAL_ID,true);  //将input设为只读
};

//详情编辑
function editDetails(subject_idx)
{
    initModal();                    //调出模态框
    var data = "LOAD_INFO;"+subject_idx;        //设置ajaxpost请求字符串
    ajaxPost(SUBJECT_MANAGE_URL,data,singleDataBind);
    $("#btnSave").css('display','inline');
    $("select [name='submitData']").attr('disabled',false);
    setInputEditable(SUBJECT_MODAL_ID,false);
};

//删除
function deleteLesson(subject_idx)
{
    bootbox.confirm({
        message:"确认删除？",
        callback:function (result){
            if (result == true)
            {
                var data = "DELETE;" + subject_idx;            //设置ajaxpost请求字符串
                ajaxPost(SUBJECT_MANAGE_URL,data,operateSuccess);
            }
        },
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
};

//新增数据
function btnInsertOnClick()
{
    initModal();      //调出模态框
    $("input").val("");
    $("select [name='submitData']").val("");
    $("#btnSave").css('display', 'inline');
    $("select [name='submitData']").attr('disabled', false);
    setInputEditable(SUBJECT_MODAL_ID,false);
}

//保存编辑或保存新增数据
function btnSaveOnClick()
{
    var subject_idx = $("#subject_idx").val();
    var inputData = getModalVal(SUBJECT_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    if (subject_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
    {
        submitData = "INSERT;" + inputData;
    }
    else
    {
        submitData = "UPDATE;" + subject_idx + ";" + inputData; 
    }
    ajaxPost(SUBJECT_MANAGE_URL, submitData, operateSuccess);
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick()
{
    refresh(SUBJECT_TABLE_ID,SUBJECT_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("[name='search']").val("");
    $("select [name='search']").val("");
    refresh(SUBJECT_TABLE_ID, SUBJECT_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess (result)
{
    bootbox.setDefaults({   //为bootbox.alert增加默认样式
        locale: "zh_CN",
        backdrop: true,
        size: 'small'
    });
    var operateResult = result === "0" ? "操作失败！" : result;
    bootbox.alert({
        message: operateResult
    });
    $("#" + SUBJECT_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    refresh(SUBJECT_TABLE_ID,SUBJECT_MANAGE_URL);
}

//区分下拉框
function loadSelect(data)
{
    switch(data)
    {
        case 'subject_type':
            ajaxPost(SUBJECT_MANAGE_URL,data,getSubTypeList);
            break;
        case 'teacher_idx':
            ajaxPost(SUBJECT_MANAGE_URL,data,getTeacherList);
            break;
        case 'room_idx':
            ajaxPost(SUBJECT_MANAGE_URL,data,getRoomList);
            break;
        case 'year_code':
            ajaxPost(SUBJECT_MANAGE_URL,data,getYearList);
            break;
        case 'class_idx':
            ajaxPost(SUBJECT_MANAGE_URL,data,getClassList);
            break;
        case 'score_group_code':
            ajaxPost(SUBJECT_MANAGE_URL,data,getScoreGroupList);
            break;
    }
    
}

//下拉框代码拼接
function getSubTypeList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        temp += "<option value=" + datas.subject_type + ">" + datas.subject_type_name + "</option>";
    }
    $("#subject_type").append(temp);
    $(".subject_type").append(temp);
}

function getTeacherList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        temp += "<option value=" + datas.teacher_idx + ">" + datas.teacher_name + "</option>";
    }
    $("#teacher_idx1").append(temp);
    $("#teacher_idx2").append(temp);
}

function getRoomList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        temp += "<option value=" + datas.room_idx + ">" + datas.room_name + "</option>";
    }
    $("#room_idx").append(temp);
}

function getYearList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        if (datas.year_status == "C") {
            temp += "<option value=" + datas.year_code + " selected=selected >" + datas.year_name + "</option>";
        }
        else {
            temp += "<option value=" + datas.year_code + " >" + datas.year_name + "</option>";
        }
        
    }
    $("#year_code").append(temp);
    $(".year").append(temp);
    refresh(SUBJECT_TABLE_ID, SUBJECT_MANAGE_URL);
}

function getClassList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        temp += "<option value=" + datas.class_idx + ">" + datas.class_name + "</option>";
    }
    $("#class_idx").append(temp);
    $(".class_idx").append(temp);
}

function getScoreGroupList(data)
{
    var obj = eval(data);
    var temp="";
    for (var i =0;i<obj.length;i++){
        var datas = obj[i];
        temp += "<option value=" + datas.score_group_code + ">" + datas.score_group_name + "</option>";
    }
    $("#score_group_code").append(temp);
}
//课时
function gotoLesson(subject_idx)
{
    cookie.set("subject_idx", subject_idx);
    cookie.set("path", "teachManage.lessonManage");
    window.location.href = "./framepage.html";
    
}
//课件
function gotoCoursware(subject_idx) {
    cookie.set("subject_idx", subject_idx);
    cookie.set("path", "teachManage.coursewareManage");
    window.location.href = "./framepage.html";
}
//作品
function gotoProject(subject_idx) {
    cookie.set("subject_idx", subject_idx);
    cookie.set("path", "teachManage.projectManage");
    window.location.href = "./framepage.html";
}
//教案
function gotoPlan(subject_idx) {
    cookie.set("subject_idx", subject_idx);
    cookie.set("path", "teachManage.planManage");
    window.location.href = "./framepage.html";
}
//成绩
function gotoScore(subject_idx) {
    cookie.set("subject_idx", subject_idx);
    cookie.set("path", "teachManage.scoreManage");
    window.location.href = "./framepage.html";
}