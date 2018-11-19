/*
作者：qianqi
创建日期：2018.9.19
文档说明：

*/

CLASS_MANAGE_URL = "schoolManage/classManage.ashx";
CLASS_TABLE_ID = "dataTable";
CLASS_MODAL_ID = "DetailModal";
CANVAS_ID = "image_can";
IMG_ARRAY = new Array();
GET_SELECT_LIST = "ashx/getSelectList.ashx";

$(function () {
    var colunms = initColunm();
    BSTable(CLASS_TABLE_ID, CLASS_MANAGE_URL, colunms);
    $("#major_name").val(loadSelect("getMajorList"));
    $("#academy_code").val(loadSelect("getAcademyList"));
});

function initColunm() {
    return [
        { title: 'ID', field: 'class_idx', align: 'center', visible: false },
        { title: '班号', field: 'class_code', align: 'center', },
        { title: '班级', field: 'class_name', align: 'center', },
        { title: '专业', field: 'major_name', align: 'center', },
        { title: '校区', field: 'academy_name', align: 'center', },
        { title: '创建时间', field: 'class_create', align: 'center', visible: false },
        { title: '更新时间', field: 'class_update', align: 'center', visible: false },
        {
            title: '操作', field: 'class_idx', align: 'center',
            formatter: function (value, row, index) {        //自定义显示可以写标签
                var res = '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.class_idx + '\',\'' + "detail" + '\')">查看</button>&nbsp&nbsp';
                    res += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.class_idx + '\',\'' + "edit" + '\')"> 编辑</button >&nbsp&nbsp';
                if (row.link_class_type == '0')
                    res += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.class_idx + '\',\'' + "addAB" + '\')"> 增加AB班</button >&nbsp&nbsp';
                res += '<button type="button" class="btn btn-default" onclick= "optBtnOnClick(\'' + row.class_idx + '\',\'' + "delete" + '\')" > 删除</button > ';
                return res;    
            }
        }
    ];
};

//调出模态框
function initModal() {
    $('#' + CLASS_MODAL_ID).modal({
        keyboard: false
    });
};

//操作列三个按键的点击函数
function optBtnOnClick(class_idx, opt) {
    switch (opt) {
        case "detail":
            viewDetails(class_idx);
            break;
        case "edit":
            editDetails(class_idx);
            break;
        case "delete":
            deleteClass(class_idx);
            break;
        case "addAB":
            addABClass(class_idx);
            break;
    }
};

//增加AB班
function addABClass(class_idx) {
    var data = "ADDABCLASS;" + class_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认增加AB班？",
        callback: function (result) {
            if (result == true)
                ajaxPost(CLASS_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true
    })
}

//查看详细
function viewDetails(class_idx) {
    initModal();                             //调出模态框
    var data = "LOAD_INFO;" + class_idx;       //设置ajaxpost请求字符串

    //将classSingleDataBind函数作为回调函数将获取到的数据绑定到相应控件，回调函数可以自行创建以适应不同情况
    ajaxPost(CLASS_MANAGE_URL, data, classSingleDataBind);     //单条数据绑定 
    $("#btnSave").css('display', 'none');     //将保存按钮隐去

    setCanvasEditable(CANVAS_ID, true);       //将照片点击功能禁用
    setInputEditable(CLASS_MODAL_ID, true);  //将input设为只读
    $("select").attr('disabled', true);
};

//详情编辑
function editDetails(class_idx) {
    initModal();                    //调出模态框
    var data = "LOAD_INFO;" + class_idx;        //设置ajaxpost请求字符串
    ajaxPost(CLASS_MANAGE_URL, data, classSingleDataBind);

    $("#btnSave").css('display', 'inline');
    setCanvasEditable(CANVAS_ID, false);     //启用点击功能上传照片
    setInputEditable(CLASS_MODAL_ID, false);
    $("select").removeAttr('disabled');
};

//删除
function deleteClass(class_idx) {
    var data = "DELETE;" + class_idx;            //设置ajaxpost请求字符串
    bootbox.confirm({
        message: "确认删除？",
        callback: function (result) {
            if (result == true)
                ajaxPost(CLASS_MANAGE_URL, data, operateSuccess)
        },
        size: 'small',
        backdrop: true
    })
};

//新增数据
function btnInsertOnClick() {
    initModal();      //调出模态框
    drawCanvasTch("");
    $("input").val("");
    $("select").val("");
    $("select").removeAttr("disabled");
    $("#btnSave").css('display', 'inline');
    setCanvasEditable(CANVAS_ID, false);
    setInputEditable(CLASS_MODAL_ID, false);
}

//保存编辑或保存新增数据
function btnSaveOnClick() {
    var class_idx = $("#class_idx").val();
    var inputData = getModalVal(CLASS_MODAL_ID);                //使用tablecontrol.js中的函数获取模态框中的数据
    var submitData = "";
    var img_base64 = IMG_ARRAY.join("").split(',')[1];
    if (class_idx == "")               //根据隐藏的idx框是否为空来判断是更新操作或是插入操作
    {
        submitData = "INSERT;" + inputData + ";" + img_base64;
    }
    else {
        submitData = "UPDATE;" + class_idx + ";" + inputData + ";" + img_base64;
    }
    ajaxPost(CLASS_MANAGE_URL, submitData, operateSuccess);
    IMG_ARRAY = []; //提交照片后清空数据
};

//搜索按钮触发函数，提交相应数据到后台
function btnSearchOnClick() {
    refresh(CLASS_TABLE_ID, CLASS_MANAGE_URL);
}

//重置按钮触发函数
function btnResetOnClick() {
    $("input[name='search']").val("");
    $("#selectType").val("");
    refresh(CLASS_TABLE_ID, CLASS_MANAGE_URL);
}

//ajax成功回调函数，根据返回的result显示提示信息
function operateSuccess(result) {
    if (result == "0") {
        bootbox.alert({
            message: "操作失败！",
            size: 'small',
            backdrop: true
        });
    }
    else {
        bootbox.alert({
            message: result,
            size: 'small',
            backdrop: true
        });
        $("#" + CLASS_MODAL_ID).modal("hide");         //操作成功后隐藏模态框
    }
    refresh(CLASS_TABLE_ID, CLASS_MANAGE_URL);
}

//作为canvas空间的onclick函数，调用隐藏的input空间的点击事件
function uploadImg() {
    document.getElementById("class_img").click();
}

//从数据库获取到单条数据利用空间id绑定到模态框对应的input控件，主要用于查看详情和编辑时获取初始数据
//data：调用ajax返回的数据
function classSingleDataBind(data) {
    var obj = eval(data)[0];
    for (var attriName in obj) {
        if ($("#" + attriName).length > 0)
            $("#" + attriName).val(obj[attriName]);
        if (attriName === "class_image") {
            var class_img = obj["class_image"];
            drawCanvasTch(class_img);
        }
    }
}

//渲染画布函数
//image_name:照片名
function drawCanvasTch(image_name) {
    var image = new Image();
    image.crossOrigin = 'Anonymous'
    if (image_name == "")
        image.src = "userDefault.jpg";
    else
        image.src = "dataImage/classImage/" + image_name;
    image.onload = () => {
        var canvas = document.getElementById("image_can")
        var ctx = canvas.getContext('2d')
        // 等比例裁剪
        let rate = image.width > 1920 ? (1920 / image.width) : 1
        // canvas确定大小
        canvas.height = image.height * rate
        canvas.width = image.width * rate
        // 在canvas绘制上传的图片
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * rate, image.height * rate)
    }
}


function loadSelect(data) {
    ajaxPost(GET_SELECT_LIST, data, selectBind);
}

function selectBind(data) {
    var obj = eval(data);
    var acatemp = "";
    var majtemp = "";
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
    $("#majorSearch").append(acatemp);
}
