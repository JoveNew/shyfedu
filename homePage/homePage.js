//@ sourceURL=homePage.js
HOMEPAGE_MANAGE_URL = "homePage/homePage.ashx";

$(function () {
    var role_type = cookie.get("role_type");
    if (role_type == "T" || role_type == "S") {
        ajaxPost(HOMEPAGE_MANAGE_URL, "getLessonData", lessonDataBind);   //获取课程表数据
    }
    else {
        $("#topTable").attr("style", "display:none");
    }
    ajaxPost(HOMEPAGE_MANAGE_URL, "getNewsData", newsDataBind);       //获取公告数据
    carouselInit();
});

//初始化课程表表格
function initLessonSchaleTable() {
    jQuery(function ($) {
        var sth = "<table class='table table-bordered table-striped' style='text-align:center'>";
        sth += "<tr style='font-weight:bold'><td></td><td>周一</td><td>周二</td><td>周三</td><td>周四</td><td>周五</td><td>周六</td><td>周日</td></tr>"
        for (var i = 1; i < 11; i++) {
            sth += "<tr>";
            sth += "<td style='width:12.5%'>" + i + "</td>";
            for (var j = 1; j <= 7; j++) {
                var id = i*10+j;
                sth += "<td id='" + id +"' style='width:12.5%'></td>";
            }
            sth += "</tr>";
        }
        $('#lessonTable').html(sth + "</table>");
    });
}

function carouselInit() {
    ajaxPost(HOMEPAGE_MANAGE_URL, "CAROUSEL", function (data) {
        var imgObjs = eval(data);      //将返回的json字符串实例化
        if (imgObjs.length>=1) {
            var img0 = "<img src='/uploadData/project/" + imgObjs[0]["perfect_project_file"] + "' class='img-responsive center-block' style='height:400px' alt='First slide'>"
            document.getElementById("picFirst").innerHTML = img0;
        }
        if (imgObjs.length >= 2) {
            var img1 = "<img src='/uploadData/project/" + imgObjs[1]["perfect_project_file"] + "' class='img-responsive center-block' style='height:400px' alt='Second slide'>"
            document.getElementById("picSecond").innerHTML = img1;
        }
        if (imgObjs.length >= 3) {
            var img2 = "<img src='/uploadData/project/" + imgObjs[2]["perfect_project_file"] + "' class='img-responsive center-block' style='height:400px' alt='Third slide'>"
            document.getElementById("picThird").innerHTML = img2; 
        }
       
        
        
         
    })
}

function lessonDataBind(data) {
    if (data != "0"){
        initLessonSchaleTable();
        var lessonObjs = eval(data);      //将返回的json字符串实例化
        for (var i = 0; i < lessonObjs.length; i++) {
            var schedule_day = parseInt(lessonObjs[i]["schedule_day"]);
            var schedule_sequence = parseInt(lessonObjs[i]["schedule_sequence"]);
            var subject_type_name = lessonObjs[i]["subject_type_name"];
            var room_name = lessonObjs[i]["room_name"];
            var teacherName = lessonObjs[i]["teacher_name"];
            var locate = schedule_day + (schedule_sequence * 10);
            document.getElementById(locate).innerHTML = subject_type_name + "<br>" + room_name;
        }
    }
}
function newsDataBind(data) {
    var newsObjs = eval(data);      //将返回的json字符串实例化
    var list = "";
    for (var i = 0; i < newsObjs.length; i++) {
        var newsTitle = newsObjs[i]["news_title"];
        var newsDay = newsObjs[i]["news_day"].split(' ')[0];
        var newsIdx = newsObjs[i]["news_idx"];
        //list += "<li><span style='float: right'>" + newsDay + "</span> <a herf='#' onclick=newsDetail(" + newsIdx + ")  title='" + newsTitle + "'>" + newsTitle + "</a></li>";
        list += "<li><a href='#' onclick=newsDetail(" + newsIdx + ")  title='" + newsTitle + "'><div class='col1'>" + newsTitle + "</div><div class='col2'><div class='date'>" + newsDay + "</div></div></a ></li>";
    }
    document.getElementById("news").innerHTML = list;
}

function newsDetail(newsIdx) {
    cookie.set("news_idx", newsIdx);
    cookie.set("path", "homePage.newsDetail");
    window.location.href = "../framepage.html";
}