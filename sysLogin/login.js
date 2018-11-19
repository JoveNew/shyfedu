/*
作者：钱祺
创建日期：2018.9.14
文档说明：
判断用户是否已经输入密码，并将用户的输入的数据传输给后台，同时根据后台传过来的result判断是否登陆成功

作者：钱祺
更新日期：2018.9.17
文档说明：
根据后台传过来的result判断为哪种用户登陆

作者：钱祺
更新日期：2018.9.18
文档说明：
将alert弹框改成跟后台一致的Bootstrap框架中的bootbox

*/

LOGIN_MANAGE_URL = "login.ashx";

$('#login').click(function () {
    check();
});

function check() {
    var userName = $("#userName").val();
    var userPwd = $("#userPwd").val();
    var userDelete = $("userdelete").val();

    if ((userName == "") || (userName == null)) {
        bootbox.alert({
            size: 'small',
            message: "请输入用户名！",
            backdrop: true
        });
    }
    else if ((userPwd == "") || (userPwd == null)) {
        bootbox.alert({
            size: 'small',
            message: "请输入密码！",
            backdrop: true
        });
    }
    else {
        userDate = "LOGIN;"+userName + "," + userPwd+","+cookie.get("openid");//设置ajaxpost请求字符串
	//alert(userDate);
        ajaxPost(LOGIN_MANAGE_URL, userDate, userLogin);
    }
    
    
}


function loginEnter() {
    if (event.which == 13) {
        check();
    }
}

function userLogin(result)
{
   // alert(result);
    if (result == "error") { 
        bootbox.alert({
            size: 'small',
            message: "用户名或密码错误！",
            backdrop: true
        });
    }
    else if (result == "error2") {
        bootbox.alert({
            size: 'small',
            message: "账户已经被冻结！",
            backdrop: true
        });
    }
	else if (result == "error_wx") {
	}
    else {
	//cookie.del("openid");
        window.location.href = "../framepage.html";
    }
}

function getQueryString(name) {
    var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

$(function () {
    	var openid = getQueryString("openid");
	var state= getQueryString("state");
	//alert(openid);
	cookie.set("openid",openid);
    	if(openid!=""&&state=="login")
	{
    		var userDate = "OPENID;"+openid
    		ajaxPost(LOGIN_MANAGE_URL, userDate, userLogin);
	}
	if(openid!=""&&state=="logout")
	{
		//var userDate = "OPENID;"+openid
    		//ajaxPost(LOGIN_MANAGE_URL, userDate, userLogin);
		
	}
})