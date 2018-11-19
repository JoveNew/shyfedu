/*

*/
FRAME_PAGE_URL = "framePage.ashx";
// 加载页面内容 path exp:schoolManage.teacherManage
function loadPageContent(path)
{
    var loadpath = "./" + path.substring(0, path.indexOf(".")) + "/" + path.substring(path.indexOf(".") + 1) + ".html";
    // 不为空则跳转
    // 不为空，也不为：空格，制表符，换页符。
    $("#" + path.substring(0, path.indexOf("."))).attr("style", "display:block");
    //高亮
    $("#" + path.substring(path.indexOf(".") + 1)).parent().attr("class", "active");
    if (loadpath.replace(/(^s*)|(s*$)/g, "").length > 0) {
        // 跳转
        $(".page-content").load(loadpath);
    }
}

// sideBar菜单onclick处理
function sideBarOnClick(menu)
{
    cookie.set("path", menu);
    window.location.reload();
};

$(function () {
	//页面刷新时调用后台获取当前账户信息
    ajaxPost(FRAME_PAGE_URL, "getAccount", setAccount);
})

function setAccount(result) {
    var account = JSON.parse(result);
    //未登录跳转登录界面
	if (account == null) {
		window.location.href = "./sysLogin/login.html";
    }
    //设置账户信息
	cookie.set("account_idx", account.account_idx);
	cookie.set("account_name", account.account_name);
    cookie.set("account_link_idx", account.account_link_idx);
    cookie.set("role_type", account.role_type);
    //顶层工具栏按钮设置
    loadTopMenu(account);
    //根据权限加载左菜单
    loadMenu(account.abilityItems);
}

//根据权限加载左菜单
function loadMenu(menuList) {
    //加载左侧一级菜单
	loadFartherMenu("学校管理", "schoolManage", menuList);
	loadFartherMenu("教学管理", "teachManage", menuList);
	loadFartherMenu("教务管理", "thingManage", menuList);
	loadFartherMenu("信息管理", "informationManage", menuList);
    loadFartherMenu("系统管理", "systemManage", menuList);
    var fartherArray = new Array();
    //加载左侧二级菜单
	for (var i = 0; i < menuList.length; i++) {
		var datas = menuList[i];
        var fartherMenu = datas.ability_name.substring(0, datas.ability_name.indexOf("."));
        var currentMenu = datas.ability_name.substring(datas.ability_name.indexOf(".") + 1);
        //if (fartherArray.indexOf(fartherMenu) == -1) {
        //    fartherArray.push(fartherMenu);//扫描权限父项
        //}
        if (datas.ability_title.indexOf("_") != -1) continue;
        var temp = "<li class='nav-item ' ><a href =# class=nav-link id='" + currentMenu + "' onclick = sideBarOnClick('" + datas.ability_name
            + "')><i class='" + datas.icon + "'/><span class= title>" + datas.ability_title + "</span ></a ></li >";
        $("#" + fartherMenu).append(temp);
        
    }
    //页面跳转
    var path = cookie.get("path");
    cookie.del("path");
    //未设置Path，跳转主页
    if (typeof (path) == "undefined") {
        var homePage = "homePage.homePage";
        loadPageContent(homePage);
    }
    //设置跳转
    else if (typeof (path) != "undefined") {
        var pathSubMenu = path.substring(path.indexOf(".") + 1);
        //设置权限
        var abilityItems = "";
        for (var i = 0; i < menuList.length; i++) {
            var datas = menuList[i];
            var fartherMenu = datas.ability_name.substring(0, datas.ability_name.indexOf("."));
            var currentMenu = datas.ability_name.substring(datas.ability_name.indexOf(".") + 1);
            if (fartherMenu == pathSubMenu) {
                if (abilityItems != "") abilityItems += ",";
                abilityItems += currentMenu;
            }
        }
        cookie.set(pathSubMenu, abilityItems);
        //跳转页面
        loadPageContent(path);
    }
}

function loadFartherMenu(title, name, menuList) {
    var temp = "<li class='nav-item start' ><a href=# class='nav-link nav-toggle' ><i class='icon-star'></i><span class='title'>" + title
        + "</span><span class='arrow'></span></a ><ul class=sub-menu id=" + name + "></ul></li>";
    for (var i = 0; i < menuList.length; i++) {
        var datas = menuList[i];
        var fartherMenu = datas.ability_name.substring(0, datas.ability_name.indexOf("."));
        if (fartherMenu == name) {
            $("#menuList").append(temp);
            break;
        }
    }
}

//加载顶层菜单
function loadTopMenu(account) {
	//设置账户显示
	var temp = "";
    $("#user_name").html(account.account_name);
    //设置我的资料
    var profileTemp = "homePage.adminProfile";
    if (account.role_type == "S") {
        profileTemp = "homePage.studentProfile";
    }
    else if (account.role_type == "T") {
        profileTemp = "homePage.teacherProfile";
    }
    $("#myProfile").attr("onclick", "sideBarOnClick('" + profileTemp + "')");
    //设置消息
    $("#messageCount").html(account.messageCount);
    for (var i = 0; i < account.messageItems.length;i++) {
        message = account.messageItems[i];
        var messageIcon = "";
        if (message.message_type == "H") {
            messageIcon = "<span class='label label-sm label-icon label-success'><i class='fa fa-plus'></i></span>";
        }
        else if (message.message_type == "P") {
            messageIcon = "<span class='label label-sm label-icon label-danger'><i class='fa fa-bolt'></i></span>";
        }
        else if (message.message_type == "C") {
            messageIcon = "<span class='label label-sm label-icon label-warning'><i class='fa fa-bell-o'></i></span>";
        }
        else if (message.message_type == "D") {
            messageIcon = "<span class='label label-sm label-icon label-info'><i class='fa fa-bullhorn'></i></span>";
        }
        temp = "<li><a href='#' onclick=\"messageClick('" + message.message_idx + "')\" >" 
            +"<span class='time'>" + message.message_time + "</span><span class='details'>" + messageIcon
            + message.message_content + "</span ></a ></li >";
        $("#messageItem").append(temp);
    }
	//设置主页
    var homePage = "homePage.homePage";
    $("#homePage").attr("onclick", "sideBarOnClick('" + homePage + "')");
    var subjectPage = "teachManage.subjectManage";
    $("#subjectPage").attr("onclick", "sideBarOnClick('" + subjectPage + "')");

    
}
//消息点击
function messageClick(messageIdx) {
    ajaxPost(FRAME_PAGE_URL, "messageRead;" + messageIdx, messageRead);
}
//消息已读
function messageRead(result) {
    var message = JSON.parse(result);
    if (message.message_type == "H") {
        cookie.set("path", "teachManage.homeworkManage");
        cookie.set("lesson_idx", message.link_idx);
    }
    else if (message.message_type == "P") {
        cookie.set("path", "teachManage.projectManage");
        cookie.set("subject_idx", message.subject_idx);
    }
    window.location.href = "./framePage.html";
}
//所有消息点击
function messageAll() {
    cookie.set("path", "informationManage.messageManage");
    window.location.href = "./framePage.html";
}
//登出点击
function logout()
{
	ajaxPost(FRAME_PAGE_URL, "logout", logoutend);
}
//登出
function logoutend() {
	window.location.href = "./sysLogin/login.html";
}




