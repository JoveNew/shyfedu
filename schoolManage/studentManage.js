//@ sourceURL=studentManage.js
STUDENT_MANAGE_URL = "schoolMANAGE/studentManage.ashx";
STUDENT_TABLE_ID = "dataTable";
STUDENT_MODAL_ID = "DetailModal";
GET_SELECT_LIST = "ashx/getSelectList.ashx"
CANVAS_ID = "image_can";
IMG_ARRAY = new Array();    //创建一个数组用来存储学生照片的base64编码

$(function () {
    var colunms = initColumn();
    BSTable(STUDENT_TABLE_ID, STUDENT_MANAGE_URL, colunms);
    loadSelect("getMajorList");
    loadSelect("getAcademyList");
    loadSelect("getClassList");
    loadSelect("getABClassList");
});

function loadSelect(data) {
    ajaxPost(GET_SELECT_LIST, data, selectBind);
}

function selectBind(data) {
    var obj = eval(data);
    var acatemp = "";
    var majtemp = "";
    var classtemp = "";
    var linkclasstemp = "";
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.academy_code) == "string") {
            acatemp += "<option value=" + datas.academy_code + ">" + datas.academy_name + "</option>";
        }
    }
    $("#academy_code").append(acatemp);
    $("#academySearch").append(acatemp);
    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.major_code) == "string")
            majtemp += "<option value=" + datas.major_code + ">" + datas.major_name + "</option>";
    }
    $("#major_code").append(majtemp);
    $("#majorSearch").append(majtemp);

    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.class_idx) == "string" && typeof (datas.link_class_type) != "string")
            classtemp += "<option value=" + datas.class_idx + ">" + datas.class_name + "</option>";
    }
    $("#class_idx").append(classtemp); 
    $("#classSearch").append(classtemp);

    for (var i = 0; i < obj.length; i++) {
        var datas = obj[i];
        if (typeof (datas.class_idx) == "string" && typeof (datas.link_class_type) == "string")
            linkclasstemp += "<option value=" + datas.class_idx + ">" + datas.class_name + "</option>";
    }
    $("#link_class_idx").append(linkclasstemp);
}

function initColumn() {
    return [
        { title: 'ID', field: 'student_idx', align: 'center', visible: false},
        { title: '学号',field: 'student_code',align: 'center',  },
        { title: '姓名',field: 'student_name',align: 'center',  },
        { title: '性别', field: 'student_sex', align: 'center', },
        { title: '班级', field: 'class_name', align: 'center', },
        { title: 'AB班', field: 'ab_class_name', align: 'center', },
        { title: '年级', field: 'student_grade', align: 'center', },
        { title: '专业',field: 'major_name',align: 'center',    },
        { title: '校区', field: 'academy_name', align: 'center', },
        { title: '学生类型', field: 'student_type', align: 'center', visible: false },
        { title: '培养类型', field: 'student_train_type', align: 'center', visible: false },
        { title: '培养方向', field: 'student_direction', align: 'center', visible: false },
        { title: '创建时间', field: 'student_create', align: 'center', visible: false},
        { title: '更新时间', field: 'student_update', align: 'center', visible: false},
        {
            title: '操作', field: 'student_idx', align: 'center',
            formatter: function (value, row, index)
            {    //自定义显示可以写标签
                return '<button type="button" class="btn btn-default" onclick="optBtnOnClick(\'' + row.student_idx + '\',\'' + "detail" + '\')">查看</button>&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.student_idx + '\',\'' + "edit" + '\')"> 编辑</button>&nbsp&nbsp\
                        <button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.student_idx + '\',\'' + "delete" + '\')" > 删除</button> ';
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + STUDENT_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(student_idx, opt) {
    switch (opt) {
        case "detail":
            viewDetails(student_idx);
            break;
        case "edit":
            editDetails(student_idx);
            break;
        case "delete":
            deleteStudent(student_idx);
            break;
    }
};

//查看详细
function viewDetails(student_idx) {
    initModal();                               //调出模态框
    var data = "LOAD_INFO;" + student_idx;     //设置ajaxpost请求字符串
    //将tablecontrol.js中的studentSingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(STUDENT_MANAGE_URL, data, studentSingleDataBind);     //单条数据绑定 
    $("#btnSave").css('display', 'none');            //隐去保存按钮
    setCanvasEditable(CANVAS_ID, true);            //将canvas设置为点击无效
    setInputEditable(STUDENT_MODAL_ID, true)         //将input设为只读
}


//详情编辑
function editDetails(student_idx) {
    initModal();                                 //调出模态框
    document.getElementById("imgName").innerHTML = "";  //清空照片名显示
    drawCanvas("");                                     //传进空字符串调用默认图片渲染canvas
    var data = "LOAD_INFO;" + student_idx;       //设置ajaxpost请求字符串
    ajaxPost(STUDENT_MANAGE_URL, data, studentSingleDataBind);     //单条数据绑定
    $("#btnSave").css('display', 'inline');
    setCanvasEditable(CANVAS_ID, false);            //将canvas设置点击触发文件上传
    setInputEditable(STUDENT_MODAL_ID, false);
}

//新增数据
function btnInsertOnClick() {
    initModal();                                        //调出模态框
    drawCanvas("");                                     //传进空字符串调用默认图片渲染canvas
    $("#DetailModal").find("input").val("");            //清空模态框各input值
    $("#DetailModal").find("select").val("");           //清空模态框各select值
    document.getElementById("imgName").innerHTML = "";  //清空照片名显示
    $("#btnSave").css('display', 'inline');             //显示保存按钮
    setCanvasEditable(CANVAS_ID, false);            //添加canvas的点击事件
    setInputEditable(STUDENT_MODAL_ID, false);          //设置input为可以编辑
}

//删除函数
function deleteStudent(student_idx) {
    var data = "DELETE;" + student_idx;         //设置ajaxpost请求字符串
    bootbox.setLocale("zh_CN");  
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(STUDENT_MANAGE_URL, data, operateSuccess);
        },
        size: 'small',
        backdrop: true
    })
};

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var student_idx = $("#student_idx").val();
    var inputData = getModalVal(STUDENT_MODAL_ID);        //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    var img_base64 = IMG_ARRAY.join("").split(',')[1];
    if (student_idx == "") {          //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
        submitData = "INSERT;" + inputData + ";" + img_base64;
    }
    else {
        submitData = "UPDATE;" + student_idx + ";" + inputData + ";" + img_base64;
    }
    ajaxPost(STUDENT_MANAGE_URL, submitData, operateSuccess);
    IMG_ARRAY=[]   //提交数据之后清空图像数组
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(STUDENT_TABLE_ID, STUDENT_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("input[name='search']").val("");
    $("select[name='search']").val("");
    refresh(STUDENT_TABLE_ID, STUDENT_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    if (result == "0") {
        alert("操作失败！")
    }
    else if (result == "查询成功") {
         
    }
    else{
        alert(result);
        $("#" + STUDENT_MODAL_ID).modal('hide');      //操作成功后隐藏模态框
    }
    refresh(STUDENT_TABLE_ID, STUDENT_MANAGE_URL);
}

//作为canvas控件的onclick函数，调用隐藏的input控件的点击事件
function uploadImg() {
    document.getElementById("student_img").click();
}

//将从数据库获取到的单条数据利用控件id绑定到模态框对应的input控件，主要用于查看详情和编辑时获取初始数据
//data：调用ajax返回的数据
function studentSingleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                    //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        };
        if (attriName === "student_image") {
            var student_image = obj["student_image"];
            drawCanvas(student_image);
        }
    };
};

//班级下拉框绑定
function classSelectBind(data) {
    var optionString = "";
    var objs = eval(data);      //将返回的json字符串实例化
    objs.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.class_idx + "'\>" + item.class_name + "</option>"; //动态添加数据
    })
    $("#class_idx").append(optionString);           // 为模态框中的校区select控件添加数据 
}

//专业下拉框绑定
function majorSelectBind(data) {
    var optionString = "";
    var objs = eval(data);      //将返回的json字符串实例化
    objs.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.major_code + "'\>" + item.major_name + "</option>"; //动态添加数据
    })
    $("#major_code").append(optionString);           // 为模态框中的校区select控件添加数据 
}

//校区下拉框绑定
function academySelectBind(data) {
    var optionString = "";
    var objs = eval(data);      //将返回的json字符串实例化
    objs.forEach(function (item, index, array) {
        optionString += "<option value=\'" + item.academy_code + "'\>" + item.academy_name + "</option>"; //动态添加数据
    })
    $("#academy_code").append(optionString);           // 为模态框中的校区select控件添加数据 
    //$("#search_academy_code").append(optionString);     //为搜索框中的校区select控件添加数据
}

