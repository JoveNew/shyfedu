CLASS_URL = "teachManage/totalClassTable.ashx";

$(function () {
    year_code = cookie.get("year_code");
    cookie.del("year_code");
    getData();
})

function getData() {
    var submitData = "LOAD_CLASS;" + year_code;
    ajaxPost(CLASS_URL, submitData, getClass);
}

function getClass(data) {
    var obj = eval(data);
    var temp = "";
    for (var i = 0; i < obj.length; i++) {
        temp += "<tr>\n"
        for (var j = 0; j < 51; j++) {
            if (j == 0)
                temp += "<td id='" + i + "_" + j + "'>" + obj[i].class_name + "</td>\n";
            else
                temp += "<td id='" + i + "_" + j + "'>&nbsp;</td>\n";
        }
        temp += "<\tr>";
    }
    $("tbody").append(temp);
    var submitData = "LOAD_INFO;" + year_code;
    ajaxPost(CLASS_URL, submitData, getTable);
}

function getTable(data) {
    //天
    var temp = "";
    for (var i = 1; i < 6; i++) {
        for (var j = 1; j < 11; j++) {
            temp += "<th>" + j + "</th>";
        }
    }
    $(".addDay").append(temp);
    //表
    var obj = eval(data);
    var rows = $("tbody").find("tr").length;
    for (var i = 0; i < obj.length; i++) {
        for (var j = 0; j < rows; j++) {
            if (obj[i].class_name == $("#" + j + "_0").text()) {
                var detail = obj[i].subject_type_name + "<br>" + obj[i].teacher_name + "<br>" + obj[i].room_name;
                if (detail != "") {
                    var location = 0;
                    location = (obj[i].schedule_day - 1) * 10 + parseInt(obj[i].schedule_sequence);
                    $("#" + j + "_" + location).html(detail);
                }
            }

        }
    }
    combineCell();
}
//合并相同单元格
function combineCell() {
    var sum = 1;
    var location = 0;
    $("tbody tr").each(function (i) {
        $(this).children('td').each(function (j) {
            var currentCell = $(this).text();
            var previousCell = $("#" + i + "_" + (j - 1)).text();
            if (currentCell == previousCell && currentCell != 0) {
                location = j - sum;
                sum++;
            }
            else if (currentCell != previousCell && previousCell != 0) {
                $("#" + i + "_" + location).attr("colspan", sum);
                for (var index = location + 1; index < location + sum; index++) {
                    $("#" + i + "_" + index).remove();
                }
                sum = 1; location = 0;
            }
        });
    });
}

function btnBackOnClick() {
    cookie.set("path", "schoolManage.yearManage");
    window.location.href = "./framepage.html";
}

function btnPrintOnClick(){
    window.print()
}