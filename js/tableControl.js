//@ sourceURL=tableControl.js
//数据表格初始化函数
//tableId:表格id，requestUrl：请求url，columns：与数据对应的生成列
function BSTable(tableId, requestUrl, columns) {
    $("#" + tableId).bootstrapTable(
        {
            method: 'post',          //指定使用post上传
            contentType: 'application/x-www-form-urlencoded',   //使用post上传数据时规定内容格式
            url: requestUrl,             //要请求数据的文件路径
            pageNumber: 1,                        //初始化加载第一页，默认第一页
            pagination: true,//是否分页
            queryParams: queryParams, //请求服务器时所传的参数
            sidePagination: 'server', //指定服务器端分页
            pageSize: 10,             //单页记录数
            pageList: [10, 25, 50,'ALL'],               //分页步进值
            responseHandler: responseHandler,     //请求数据成功后，渲染表格前的方法
            striped: true,  //斑马纹
            undefinedText: '-',   //当数据为undifined时显示的字符
            columns: columns,
            showColumns: true,

            showExport: true,                     //是否显示导出
            exportDataType: "basic",              //basic', 'all', 'selected'
            buttonsAlign: "right",                //按钮位置
            Icons: 'glyphicon-export',
            exportTypes: ['json', 'csv', 'excel'],
            exportOptions: {
                ignoreColumn: [-1],  //忽略某一列的索引
            },
        });
};

//表格控件的提交数据，初始化时或当点击翻页时便将以下数据通过url提交到后台
function queryParams(params) {
    return {
        //pageSize: params.limit,      //每一页的数据行数，默认是上面设置的10(pageSize)
        //pageIndex: params.offset / params.limit + 1,   //当前页面,默认是上面设置的1(pageNumber)
        submitData: "LOAD_LIST;" + params.limit + "," + (params.offset / params.limit + 1) + ";" + getSearchParas(),    //操作类型
    }
};

//表格控件的数据处理函数，total为返回的总条数，rows为具体数据
function responseHandler(result) {
    return {
        total: result.total,            //总页数,前面的key必须为"total"
        rows: result.rows,              //行数据，前面的key要与之前设置的dataField的值一致.
    };
};

//表格刷新函数
//tableId：对应表格Id，requestUrl：对应的url
function refresh(tableId, requestUrl) {
    $("#" + tableId).bootstrapTable('refresh', { url: requestUrl });
};

//ajax封装函数
//requestUrl：请求url，successFn：调用成功后的回调函数
//submitData：提交的数据，格式默认为"操作类型；下标索引；提交的数据"，其中操作类型为必须项，三项之间用";"隔开
function ajaxPost(requestUrl, submitData, successFn) {
    submitData = (submitData == null || submitData == "" || typeof (submitData) == "undefined") ? { "submitData": new Date().getTime() } : submitData;
    $.ajax({
        type: "post",
        data: {
            submitData: submitData,
        },
        url: requestUrl,
        //dataType: "json",
        success: function (result) {
            successFn(result);
        },
        error: function (er) {
            alert("提交失败！");
        }
    });
};

//将从数据库获取到的单条数据利用控件id绑定到模态框对应的input控件，主要用于查看详情和编辑时获取初始数据
//data：调用ajax返回的数据
function singleDataBind(data) {
    var obj = eval(data)[0];      //将返回的json字符串实例化，因为是以数组形式返回单条数据，所以下标取0
    for (var attriName in obj) {                    //遍历对象中的每一个属性名，即数据库中的字段名
        if ($("#" + attriName).length > 0) {           //如果与属性名对应的控件存在，则将数据绑定
            $("#" + attriName).val(obj[attriName]);
        };
    };
};
//渲染画布函数
//image_name:照片名
function drawCanvas(image_name) {
    var image = new Image();
    image.crossOrigin = 'Anonymous';             
    image_name = image_name || "userDefault.jpg";    //若image_name为空则赋值默认图片名
    image.src = "dataImage/studentImage/" + image_name;
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

//获取模态框内所有input的id及值，返回可以直接嵌入到sql插入语句中的字符串
function getSearchParas() {
    var inputData = "";
    $("[name='search']").each(function () {
        inputData += $(this).val() + ",";
    })
    return inputData;
}

//获取模态框内所有input的id及值，返回可以直接嵌入到sql插入语句中的字符串
//modalId: 模态框Id
function getModalVal(modalId) {
    var inputData = "";
    $("#" + modalId + " [name='submitData']").each(function () {
        inputData += $(this).val() + ",";
    })
    return inputData;
};

//编辑模态框内所有的input[name='submitData']，根据传进来的isReadOnly参数是否为真设为只读或可写
//modalId: 模态框Id，isReadOnly：是否为只读。传进来为true时设为只读，传进来为false时设为可写
function setInputEditable(modalId, isReadOnly) {
    if (isReadOnly == true) {
        $("#" + modalId + " input[name='submitData']").attr("readonly", "readonly");  //设为只读
        $("#" + modalId + " select[name='submitData']").attr("disabled", "true");  //不可用
    }
    else {
        $("#" + modalId + " input[name='submitData']").removeAttr("readonly");        //可以编辑
        $("#" + modalId + " select[name='submitData']").removeAttr("disabled");        //可用
    }
}


//将模态框内的input值清空，用于新增数据时使模态框内各input为空
//modalId: 模态框Id
function clearInput(modalId) {
    $("input").attr("value", "");
}

//控制canvas控件的点击事件
//canvasId：控件id    isReadOnly：只读性，True为只读，删去点击事件，False为可写添加点击事件
function setCanvasEditable(canvasId, isReadOnly) {
    var canvasControl = $("#" + canvasId);                  //获取canvas控件
    if (isReadOnly === true) {                              //如果设置为只读
        canvasControl.attr("onclick", "");                  //给控件删除点击事件
    }
    if (isReadOnly === false) {                             //如果设置为可以编辑
        canvasControl.attr("onclick", "uploadImg()");       //给控件添加点击事件
    }
}

/**
   * 处理 input<type="file"> : onchange 事件
   * @param {HTMLElement} inputReference - input<file>组件的引用
   * @param {Object} paramContainer - 图片编码存放数组的引用的对象
   * @param {String} imageProName - {paramContainer}中访问图片编码存放数组的属性名
   * @param {String} canvasId - html页面中canvas的id
   * @param {Number} maxWidth - 裁剪后的最大宽度
   * @param {Number} compressionQuality - 质量压缩比例 0.1~1.0
   */
function handlePreview(inputReference, paramContainer, canvasId, maxWidth = 1920, compressionQuality = 0.8) {
    //@ sourceURL=imgUpload.js
    // 获取上传的文件对象
    const file = inputReference.files
    // 文件列表为空？
    if (file.length !== 0) {
        // 判断是否是正确的图片文件
        let flag = true
        let fileA = Array.from(file)
        fileA.forEach(v => {
            flag = flag && !/image\//.test(v.type)
        })
        if (flag) {
            // 此处 弹出错误
            // 请选择正确的图片文件
            alert("图片错误");
        } else {
            //获取照片方向角属性，用户旋转控制 
            EXIF.getData(file['0'], function () {
                // alert(EXIF.pretty(this)); 
                EXIF.getAllTags(this);
                //alert(EXIF.getTag(this, 'Orientation'));  
                Orientation = EXIF.getTag(this, 'Orientation');
                //return; 
            });
            // 新建FileReader实例（IE10+）
            const oFReader = new FileReader()
            // 为FileReader创建回调事件，以便于加载预览至img标签
            oFReader.onload = (oFREvent) => {
                // 新建HTMLImageElement实例（IE9+）
                const image = new Image()
                image.crossOrigin = 'Anonymous'
                let dataURL = null
                // 为Image创建回调事件，以便于加载预览及创建base64编码
                image.onload = () => {
                    // HTMLCanvas
                    const canvas = document.getElementById(canvasId)
                    const ctx = canvas.getContext('2d')
                    // 等比例裁剪
                    let rate = image.width > maxWidth ? (maxWidth / image.width) : 1
                    // canvas确定大小
                    canvas.height = image.height * rate
                    canvas.width = image.width * rate
                    // 在canvas绘制上传的图片
                    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * rate, image.height * rate)
                    if (Orientation != "" && Orientation != 1) {
                        switch (Orientation) {
                            case 6://需要顺时针（向左）90度旋转 
                                rotateImg(image, 'left', canvas);
                                break;
                            case 8://需要逆时针（向右）90度旋转 
                                rotateImg(image, 'right', canvas);
                                break;
                            case 3://需要180度旋转 
                                rotateImg(image, 'right', canvas);//转两次 
                                rotateImg(image, 'right', canvas);
                                break;
                        }
                    }
                    // 在canvas中裁剪、压缩并输出base64编码
                    dataURL = canvas.toDataURL('image/jpeg', compressionQuality)
                    paramContainer.push(dataURL)
                }
                // 加载Image
                image.src = oFREvent.target.result
            }
            // FileReader 解析待上传的文件
            for (let f of fileA) {
                oFReader.readAsDataURL(f)
            }
            inputReference.value = ''
        }
    }
}

//对图片旋转处理 added by lzk 
function rotateImg(img, direction, canvas) {
    //alert(img); 
    //最小与最大旋转方向，图片旋转4次后回到原方向  
    var min_step = 0;
    var max_step = 3;
    //var img = document.getElementById(pid);  
    if (img == null) return;
    //img的高度和宽度不能在img元素隐藏后获取，否则会出错  
    var height = img.height;
    var width = img.width;
    //var step = img.getAttribute('step');  
    var step = 2;
    if (step == null) {
        step = min_step;
    }
    if (direction == 'right') {
        step++;
        //旋转到原位置，即超过最大值  
        step > max_step && (step = min_step);
    } else {
        step--;
        step < min_step && (step = max_step);
    }

    //旋转角度以弧度值为参数  
    var degree = step * 90 * Math.PI / 180;
    var ctx = canvas.getContext('2d');
    switch (step) {
        case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;
        case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
        case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
        case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
    }
}  


var cookie = {
    set: function (key, val, expiresSeconds) {//设置cookie方法
        var date = new Date(); //获取当前时间
        var time = expiresSeconds;  //将date设置为n秒以后的时间
        date.setTime(date.getTime() + time * 1000); //格式化为cookie识别的时间
        
        document.cookie = key + "=" + val + ";expires=" + date.toGMTString();  //设置cookie
        
    },
    get: function (key) {//获取cookie方法
        /*获取cookie参数*/
        var getCookie = document.cookie.replace(/[ ]/g, "");  //获取cookie，并且将获得的cookie格式化，去掉空格字符
        var arrCookie = getCookie.split(";")  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
        var tips;  //声明变量tips
        for (var i = 0; i < arrCookie.length; i++) {   //使用for循环查找cookie中的tips变量
            var arr = arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
            if (key == arr[0]) {  //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
                tips = arr[1];   //将cookie的值赋给变量tips
                return tips;
                break;   //终止for循环遍历
            }
        }
    },
    del: function (key) { //删除cookie方法
        var date = new Date(); //获取当前时间
        date.setTime(date.getTime() - 10000); //将date设置为过去的时间
        document.cookie = key + "=v; expires =" + date.toGMTString(); //设置cookie
    }
}

