SCHEDULE_MANAGE_URL = "teachManage/scheduleManage.ashx";

SCHEDULE_SELECTED = 0;

$(function () {
    
    initScheduleTable();
    
    ajaxPost(SCHEDULE_MANAGE_URL, 'room_idx', getRoomList);
    ajaxPost(SCHEDULE_MANAGE_URL, 'class_idx', getClassList);
    ajaxPost(SCHEDULE_MANAGE_URL, 'teacher_idx', getTeacherList);
    ajaxPost(SCHEDULE_MANAGE_URL, 'year_code', getYearList);
})

function initScheduleTable() {
    var day = 5;
    var sequence = 10;  
    var sth = "<table border = '1' style='width:100%;text-align:left;table-layout:fixed' id='ScheduleTable_Table'>";
    sth += "<tr style='font-weight:bold'><th width='30'></th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th></tr>"
    for (var i = 1; i <= sequence; i++) {
        sth += "<tr >";
        sth += "<td height='50px'>" + i + "</td>";
        for (var j = 1; j <= day; j++) {
            var id = i * 10 + j;
            sth += "<td name='lessonBlank' onClick='setOneLesson(" + i+","+j+ ")' id='" + id + "' width='100' ></td>";
        }
        sth += "</tr>";
    }
    $('#ScheduleTable').html(sth + "</table>");
}

function setOneLesson(sequence, day) {
    var id = sequence * 10 + day;
    var temp = $('#' + id).html();
    var classIdx = $('#classSelect').val();
    var subjectType = $('#subjectTypeSelect').val();
    var teacherIdx = $('#teacherSelect').val();
    var roomIdx = $('#roomSelect').val();
    var yearCode = $('#yearSelect').val();
    if (temp.length > 0) {

    }
    else if ($('input[name="fun"]:checked').val() == "move" && SCHEDULE_SELECTED != 0) {
        var submitObj = new Object();
        submitObj.schedule_idx = SCHEDULE_SELECTED;
        SCHEDULE_SELECTED = 0;
        submitObj.schedule_day = day;
        submitObj.schedule_sequence = sequence;
        var submitData = "MOVE;" + JSON.stringify(submitObj);
        ajaxPost(SCHEDULE_MANAGE_URL, submitData, moveOneLesson);

    }
    else
    {
        //检查是否可设置课程
         if (yearCode != "" && classIdx != "" && subjectType != "" && teacherIdx != "" && roomIdx != ""){
            var submitObj = new Object();
            submitObj.year_code = yearCode;
            submitObj.class_idx = classIdx;
            submitObj.teacher_idx = teacherIdx;
            submitObj.room_idx = roomIdx;
            submitObj.subject_type = subjectType;
            submitObj.schedule_day = day;
            submitObj.schedule_sequence = sequence;
            submitObj.subject_type_name = $('#subjectTypeSelect').find("option:selected").text();
            submitObj.teacher_name = $('#teacherSelect').find("option:selected").text();
            submitObj.class_name = $('#classSelect').find("option:selected").text();
            submitObj.room_name = $('#roomSelect').find("option:selected").text();
            var submitData = "INSERT;" + JSON.stringify(submitObj);
            ajaxPost(SCHEDULE_MANAGE_URL, submitData, addOneLesson);
         }
    }  
}
function deleteOneLesson(data) {
    if (data == '0') {
        bootbox.alert({
            message: "删除失败"
        });
    }
    else {
        data = JSON.parse(data);
        var id = data.schedule_sequence.toString() + data.schedule_day.toString();
        //$('#' + id).html("");
        cookie.set("subjectTypeSelectVal", $("#subjectTypeSelect").val());
        $("#classSelect").trigger("change");
    }
}


function moveOneLesson(data) {
    if (data == '0') {
        bootbox.alert({
            message: "移动失败,存在冲突"
        });
    }
    else {
        cookie.set("subjectTypeSelectVal", $("#subjectTypeSelect").val());
        $("#classSelect").trigger("change");
    }
}

function addOneLesson(data) {
    if (data == '0') {
        bootbox.alert({
            message: "新增失败,请重新刷新数据确认【班级】【教师】【教室】是否被占用"
        });
    }
    else {
        data = JSON.parse(data);
        //addLessonBlank(data);
        cookie.set("subjectTypeSelectVal",$("#subjectTypeSelect").val());
        $("#classSelect").trigger("change");
    }
}



function yearChange() {
    getLessonBlank(0);
}

function classChange() {
    var classIdx = $('#classSelect').val();
    var yearCode = $('#yearSelect').val();
    if (classIdx == "") classIdx = "0";
    ajaxPost(SCHEDULE_MANAGE_URL, 'subject_type;' + classIdx + ";" + yearCode, getSubTypeList);
    getLessonBlank(0);
}

function subjectTypeChange() {
    refreshLessonBlank();
}

function teacherChange() {
    getLessonBlank(0);
}

function roomChange() {
    getLessonBlank(0);
}

function oneLessonClick(sequence, day, idx) {
    var id = sequence + day
    var fun = $('input[name="fun"]:checked').val();//获取快速操作
    if (fun == "move") {
        if (SCHEDULE_SELECTED == 0) {
            $('#s' + idx).attr("class", "redbor");
            SCHEDULE_SELECTED = idx;
            getLessonBlank(idx);
        }
        else if (SCHEDULE_SELECTED == idx) {
            $("#classSelect").trigger("change");
        }
    }
    if (fun == "delete") {
        var submitObj = new Object();
        submitObj.schedule_idx = idx;
        var submitData = "DELETE;" + JSON.stringify(submitObj);
        ajaxPost(SCHEDULE_MANAGE_URL, submitData, deleteOneLesson);
    }
}

//新增一格课程
function addLessonBlank(data,color) {
    var id = data.schedule_sequence.toString() + data.schedule_day.toString();
    var meno = "<div id='s" + data.schedule_idx + "' class='" + color+"' onClick='oneLessonClick(" + data.schedule_sequence + "," + data.schedule_day+"," + data.schedule_idx+")'>"
        + "<table><tr><td align='center'><b><span class='label label-success' name='subjectType'  value='" + data.subject_type + "'> "
        + data.subject_type_name
        + "</span></b></td><td align='center'><span class='label label-success' name='teacherIdx' value='" + data.teacher_idx + "'> "
        + data.teacher_name
        + "</span></td></tr><tr><td align='center'><b><span class='label label-success' name='classIdx'  value='" + data.class_idx + "'> "
        + data.class_name
        + "</span></b></td><td align='center'><span class='label label-success' name='roomIdx' value='" + data.room_idx + "'> "
        + data.room_name + "</td></tr></table></div>";
    $('#' + id).append(meno);  
}


//获取当前相关课程
function getLessonBlank(scheduleIdx) {
    var classIdx = $('#classSelect').val();
    var subjectType = $('#subjectTypeSelect').val();
    var teacherIdx = $('#teacherSelect').val();
    var roomIdx = $('#roomSelect').val();
    var yearCode = $('#yearSelect').val();
    var submitObj = new Object();
    submitObj.year_code = yearCode;
    submitObj.class_idx = classIdx;
    submitObj.teacher_idx = teacherIdx;
    submitObj.room_idx = roomIdx;
    if (scheduleIdx != 0) {
        submitObj.schedule_idx = scheduleIdx;
        var submitData = "LOAD_SELECT_ALL;" + JSON.stringify(submitObj);
        lockTable();
        ajaxPost(SCHEDULE_MANAGE_URL, submitData, setLessonBlank2);
    }
    else if (yearCode != "" && (classIdx != "" || teacherIdx != "" || roomIdx != "")) {
        var submitData = "LOAD_ALL;" + JSON.stringify(submitObj);
        clearLessonBlank();
        lockTable();
        ajaxPost(SCHEDULE_MANAGE_URL, submitData, setLessonBlank);
    }
    else {
        clearLessonBlank();
    }
}
//设置相关所有课程
function setLessonBlank(result) {
    var obj = eval(result);
    for (var i = 0; i < obj.length; i++) {
        addLessonBlank(obj[i],"bluebor");
    }
    refreshLessonBlank();
}

function setLessonBlank2(result) {
    var obj = eval(result);
    for (var i = 0; i < obj.length; i++) {
        addLessonBlank(obj[i], "yellowbor");
    }
    refreshLessonBlank();
}

//清楚界面所有课程
function clearLessonBlank() {
    $("[name='lessonBlank']").each(function () {
        $(this).html("");
    })
    SCHEDULE_SELECTED = 0;
}


//刷新界面label标签显示
function refreshLessonBlank() {
    $("[name='classIdx']").each(function () {
        if ($(this).attr("value") == $("#classSelect").val()) {
            $(this).attr("class", "label label-success");
        }
        else {
            $(this).attr("class", "text-muted");
        }
    })
    $("[name='subjectType']").each(function () {
        if ($(this).attr("value") == $("#subjectTypeSelect").val()) {
            $(this).attr("class", "label label-success");
        }
        else {
            $(this).attr("class", "text-muted");
        }
    })
    $("[name='teacherIdx']").each(function () {
        if ($(this).attr("value") == $("#teacherSelect").val()) {
            $(this).attr("class", "label label-success");
        }
        else {
            $(this).attr("class", "text-muted");
        }
    })
    $("[name='roomIdx']").each(function () {
        if ($(this).attr("value") == $("#roomSelect").val()) {
            $(this).attr("class", "label label-success");
        }
        else {
            $(this).attr("class", "text-muted");
        }
    })
    unLockTable();
}

function lockTable() {
    $('#ScheduleTable_Table').attr('disabled', 'disabled');
}

function unLockTable() {
    $('#ScheduleTable_Table').removeAttr('disabled');
}


//加载下拉菜单
function getRoomList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.room_idx + " name=" + datas.room_name+ ">" + datas.room_name + "</option>";
    }
    $("#roomSelect").append(temp);
    $("#roomSelect").trigger("chosen:updated");
    $("#roomSelect").chosen();
}

function getClassList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.class_idx + " name=" + datas.class_name+">" + datas.class_name + "</option>";
    }
    $("#classSelect").append(temp);
    $("#classSelect").trigger("chosen:updated");
    $("#classSelect").chosen();
}

function getTeacherList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.teacher_idx + " name=" + datas.teacher_name+ ">" + datas.teacher_name + "</option>";
    }
    $("#teacherSelect").append(temp);
    $("#teacherSelect").trigger("chosen:updated");
    $("#teacherSelect").chosen();
}

function getSubTypeList(data) {
    var obj = eval(data);
    var temp = "<option value=''selected='selected' name='-'>---课程选择---</option>";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (datas.term != datas.num)
            temp += "<option value=" + datas.subject_type + " name=" + datas.subject_type_name + " >" + "[" + datas.subject_type + "]" + datas.subject_type_name + "["+datas.num+"/"+ datas.term + "]" + "</option>";
    }
    $("#subjectTypeSelect").html(temp);
    var subjectTypeSelectVal = cookie.get("subjectTypeSelectVal");
    cookie.del("subjectTypeSelectVal");
    if (subjectTypeSelectVal != null) $("#subjectTypeSelect").val(subjectTypeSelectVal);
    if ($("#subjectTypeSelect").val() == null) $("#subjectTypeSelect").val("");
    $("#subjectTypeSelect").trigger("chosen:updated");
    $("#subjectTypeSelect").chosen();
}

function getYearList(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        temp += "<option value=" + datas.year_code + ">" + datas.year_name + "</option>";
    }
    $("#yearSelect").append(temp);
    
    var year_code = cookie.get("year_code");
    cookie.del("year_code");
    $('#yearSelect').val(year_code);
    $("#yearSelect").trigger("chosen:updated");
    $("#yearSelect").chosen();
}

function btnBackOnClick() {
    cookie.set("path", "schoolManage.yearManage");
    window.location.href = "./framepage.html";
}


