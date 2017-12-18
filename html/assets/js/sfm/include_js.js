if(typeof LOADED=="undefined") {
	LOADED=[];
}
// if(typeof LOADED['include_js.js'] == "undefined") {
	LOADED['include_js.js']=true;
	function LoadJs(src,object,onload) {
		if(!object) {
			object=document.getElementsByTagName("head")[0];
		}
		var element=document.createElement("script");
		element.type="text/javascript";
		element.src=src;
		object.appendChild(element);
		if(onload){
			AddOnload(onload,element);
		}
		return element;
	}
	var jqueryScriptElement;
	function jqueryLoad() {
		if(typeof $=="undefined"&&!jqueryScriptElement) {
			$=function(){};
			jqueryScriptElement=LoadJs("/scripts/jquery.js");
		}
	}
	jqueryLoad();
	function jqueryLoaded() {
		var type=(typeof jQuery);
		if(type=="undefined") {
			return false;
		} else {
			return true;
		}
	}
	function jqueryExec(func){
		if(!jqueryLoaded()) {
			AddOnload(func,jqueryScriptElement);
		} else {
			func();
		}
	}
	function jq(id) {
		return id.replace(/(:|\.\[\])/g,'\\$1');
	}
	function trim(text) {
		return $.trim(text);
	}
	function ajaxObject() {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.6.0");
		} catch(e) {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP.3.0");
			} catch(e) {
				try {
					return new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e) {
					try{
						return new ActiveXObject("Microsoft.XMLHTTP");
					} catch(e) {
						try {
							return new XMLHttpRequest();
						} catch(e) {
							throw new Error("This browser does not support XMLHttpRequest.");
						}
					}
				}
			}
		}
	}
	function ajax_request(url,div_processing) {
		if(div_processing !== null&&div_processing !== "") {
			if(document.getElementById(div_processing) !== null) {
				document.getElementById(div_processing).style.display="inline";
			}
		}
		var response=ajax_request2(url,"GET","","","","","");
		if(div_processing !== null&&div_processing !== "") {
			if(document.getElementById(div_processing) !== null) {
				document.getElementById(div_processing).style.display="none";
			}
		}
		return response;
	}
	function ajax_request2(url,method,params,async_callback,last_modified,optional_headers) {
		if(method!="POST") {
			method="GET";params=null;
		}
		if(last_modified === "") {
			last_modified=null;
		}
		var request = new ajaxObject();
		var async=!(async_callback === null||async_callback === undefined||async_callback === ""||async_callback === false);
		if(async) {
			request.onreadystatechange = function() {
				if(request.readyState==4) {
					var response=request.responseText;eval(async_callback);
				}
			};
		}
		request.open(method,url,async);
		if(last_modified !== null) {
			request.setRequestHeader("If-Modified-Since",last_modified);
		}
		if(method=="POST") {
			request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.setRequestHeader("Content-length",params.length);
			request.setRequestHeader("Connection","close");
		}
		request.send(params);
		if(!async) {
			if(!request.getResponseHeader("Date")&&last_modified === null) {
				var cached=request;last_modified=cached.getResponseHeader("Last-Modified");
				last_modified=(last_modified)?last_modified:new Date(0);
				request=ajax_request2(url,method,params,async,last_modified);
				if(request.status==304){
					request=cached;
				}
			}
			response=request.responseText;
		}
		return response;
	}

	function ajax(name,action,variables,async_callback) {
		var div_processing='';
		var div_response='';
		if(name !== null && name !== "") {
			if(document.getElementById('div_processing_'+name) !== null){
				div_processing='div_processing_'+name;
			}
			if(document.getElementById('div_response_'+name) !== null) {
				div_response='div_response_'+name;
			}
		}
		if(div_response !== "") {
			document.getElementById(div_response).innerHTML="";
		}
		var url="?ajax=";
		if(action.substring(0,1)=="?") {
			url+=action.substring(1,action.length);
		} else {
			url="/ajax.php"+url+action;
		}
		if(!!variables&&variables.length>0) {
			for(var i=0;i<variables.length;i++) {
				if(i%2 === 0){
					url+="&"+variables[i]+"=";
				} else {
					url+=variables[i];
				}
			}
		}
		if(div_processing !== "") {
			document.getElementById(div_processing).style.display="inline";
		}
		var finish="";
		if(div_processing !== "") {
			finish+="document.getElementById('"+div_processing+"').style.display = 'none';";
		}
		if(div_response !== "") {
			finish+="document.getElementById('"+div_response+"').innerHTML = response;";
		}
		var async=!(async_callback === null||async_callback === undefined||async_callback === ""||async_callback === false);
		var async_callback_new="";
		if(async) {
			async_callback_new=finish;
			if(async_callback !== true) {
				async_callback_new+=async_callback;
			}
		}
		var response=ajax_request2(url,"GET","",async_callback_new,"","","");
		if(!async) {
			eval(finish);
		}
		return response;
	}

	function AddEventHandler(exec,object,event_type,exec_return) {
		var new_handler = function(event) {
			if(typeof exec=='function') {
				return_val=exec(event);
			} else {
				return_val=eval(exec);
			}
			if(return_val !== null) {
				return return_val;
			}
		};
		if(object.addEventListener&&!exec_return) {
			object.addEventListener(event_type,new_handler,false);
		} else if(object.attachEvent&&!exec_return) {
			object.attachEvent("on"+event_type,new_handler);
		} else {
			var old_handler=eval("object.on"+event_type);
			var new_handler2 = function(event) {
				if(typeof old_handler=='function') {
					return_val_old=old_handler(event);
				}
				return_val_new=new_handler(event);
				if(typeof return_val_new !== "undefined"&&return_val_new !== null&&return_val_new !== undefined) {
					return return_val_new;
				}
				if(typeof return_val_old!="undefined"&&return_val_old !== null&&return_val_old !== undefined) {
					return return_val_old;
				}
			};
			eval("object.on"+event_type+" = new_handler2");
		}
	}
	function AddOnload(exec,object) {
		if(jqueryLoaded()) {
			if(!object) {
				$(exec);
			} else {
				$(object).load(exec);
			}
		} else {
			if(!object) {
				object=window;
			}
			AddEventHandler(exec,object,"load");
		}
	}
	function _GLOBALS(name,from) {
		var variable=null;
		if(typeof from=='undefined') {
			from="G,C";
		}
		from=from.split(",");
		for(var i=0;i<from.length;i++) {
			var from_type=from[i];
			if(typeof $!="undefined") {
				if(from_type=="G"&&typeof $.url!="undefined") {
					variable=$.url.param(name);continue;
				}
				if(from_type=="C"&&typeof $.cookie!="undefined") {
					variable=$.cookie(name);continue;
				}
			}
			var variables="";
			var delimiter="";
			if(from_type=="G") {
				variables=window.location.search;variables="&"+variables.substring(1,variables.length);
				delimiter="&";
			} else if(from_type=="C") {
				variables=";"+document.cookie;
				delimiter="; ?";
			} else {
				continue;
			}
			if(variables.length<1){
				continue;
			}
			var temp="";
			var ex_start=new RegExp(delimiter+name+"=","");
			temp=variables.split(ex_start);
			if(temp[1]) {
				var ex_middle=new RegExp(delimiter,"");
				temp=temp[1].split(ex_middle);
				variable=temp[0];
			}
		}
		if(variable !== null){
			variable=unescape(variable);
		}
		return variable;
	}
	function _GET(name) {
		return _GLOBALS(name,"G");
	}
	function _COOKIE(name) {
		return _GLOBALS(name,"C");
	}
	function StripNonDigits(value) {
		value+="";
		return value.replace(/[^0-9]/g,'');
	}
	function is_int(input,strict) {
		result=(!isNaN(input)&&parseInt(input) == input);
		if(strict === true && typeof(input) != 'number'){
			result=false;
		}
		return result;
	}
	function is_float(input) {
		input=input.replace('.','');
		result=is_int(input);
		return result;
	}
	function ValidUSPhone(value) {
		value+="";
		value=StripNonDigits(value);
		valid=value.match(/^[0-9]{10}$/);
		valid=(valid !== null);
		return valid;
	}
	function ValidEmail(value) {
		value+="";
		valid=value.match(/^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i);
		valid=(valid !== null);
		return valid;
	}
	function FixEntities(str) {
		str=str.replace(/\&amp;/g,'&');
		str=str.replace(/\&lt;/g,'<');
		str=str.replace(/\&gt;/g,'>');
		str=str.replace(/\&#39;/g,"'");
		return str;
	}
	function GetElementPosition(element) {
		var position=[0,0,0,0];
		if(element === null||element === undefined) {
			return position;
		}
		for(var i=0;element !== null;i++) {
			position[0]+=element.offsetLeft;
			position[1]+=element.offsetTop;
			if(i === 0) {
				position[2]+=element.offsetWidth;
				position[3]+=element.offsetHeight;
			}
			if(element.offsetParent !== null&&element.offsetParent !== undefined) {
				element=element.offsetParent;
			} else {
				break;
			}
		}
		return position;
	}
	function SelectAll(id) {
		document.getElementById(id).focus();
		document.getElementById(id).select();
	}
	function select_radio(radio,option_value) {
		if(radio === null) {
			return;
		}
		var radio_length=radio.length;
		if(radio_length === undefined) {
			radio.checked=(radio.value==option_value);
			return;
		}
		for(var i=0;i<radio_length;i++) {
			if(radio[i].value==option_value) {
				radio[i].checked=true;
			} else {
				radio[i].checked=false;
			}
		}
	}
	function select_option(select,option_value) {
		if(select === null) {
			return;
		}
		var options_length=select.options.length;
		for(var i=0;i<options_length;i++) {
			if(select.options[i].value==option_value) {
				select.selectedIndex=i;
				return select.options[i];
			} else{

			}
		}
	}
	function toggle_checkbox(checkbox) {
		if(checkbox === null) {
			return;
		}
		checkbox.checked=!checkbox.checked;
	}
	function jq_toggle_checkbox_span(span,type) {
		$(span).parent().children(':'+type).each(function() {
			$(this).attr('checked',(type=="radio"||!$(this).attr('checked')));
		});
	}
	var tracked_urls = [];
	function track_url(url,once) {
		var track=true;
		if(once !== null&&once === true) {
			if(tracked_urls[url] !== null) {
				track=false;
			} else {
				tracked_urls[url]=true;
			}
		}
		if(track === true) {
			ajax_request('url='+url);
		}
	}
	function popUpVideo(URL,width,height) {
		day=new Date();
		id=day.getTime();
		if(width === null||width === undefined||width === ""||width === 0) {
			width=685;
		}
		if(height === null||height === undefined||height === ""||height === 0) {
			height=480;
		}
		eval("page"+id+" = window.open(URL, id, 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width="+width+",height="+height+"');");
	}
	function search_sort(sort_value) {
		if(document.form_select){
			if(document.form_select.sort.options[document.form_select.sort.selectedIndex].value==sort_value) {
				order_index=document.form_select.order.selectedIndex+1;
				if(order_index==document.form_select.order.options.length) {
					order_index=0;
				}
				select_option(document.form_select.order,document.form_select.order.options[order_index].value);
			} else {
				sort_option=select_option(document.form_select.sort,sort_value);
				sort_option.onclick();
			}
			document.form_select.submit.click();
		}
	}
	function ToggleNotesPopup(div_id,div_type,close_others){
		if(div_type === null){div_type="hover";}
		if(close_others === null){
			if(div_type=="normal"){close_others=true;}
			else{close_others=false;}
		}
		if(document.getElementById('div_notespopup_'+div_id).style.visibility=='visible'){
			if(div_type=="normal"){document.last_div_normal=null;}
			document.getElementById('div_notespopup_'+div_id).style.visibility='hidden';
			document.getElementById('div_notespopup_'+div_id).style.display='none';
		}else{
			if(close_others === true){
				if(document.last_div_normal !== null){
					document.getElementById('div_notespopup_'+document.last_div_normal).style.visibility='hidden';
					document.getElementById('div_notespopup_'+document.last_div_normal).style.display='none';
				}
				document.last_div_normal=div_id;
			}
			document.getElementById('div_notespopup_'+div_id).style.visibility='visible';
			document.getElementById('div_notespopup_'+div_id).style.display='inline';
			var new_top=0;
			var new_left=0;
			var element=document.getElementById('span_notespopup_'+div_id);
			while(element.offsetParent !== null){
				if(element.id !== null&& element.id.substring(0,15)=="div_notespopup_" ){
					break;
				}
				//alert(element.id + "/ top:" + element.offsetTop + "/ left:" + element.offsetLeft);
				//break;
				new_top+=element.offsetTop;
				new_left+=element.offsetLeft;
				element=element.offsetParent;
			}
			//document.getElementById('div_notespopup_'+div_id).style.top=new_top+"px";d
			//document.getElementById('div_notespopup_'+div_id).style.left=new_left+"px";
		}
	}
function ValidateFormLead(form,type,phone_optional){
	errors="";
	if(type=="infusion"){
		name_field="inf_field_FirstName";
		email_field="inf_field_Email";
		phone_field="inf_field_Phone1";
	}else{
		name_field="name";
		email_field="from";
		phone_field="custom Phone";
	}
	var name = $("input[name='" + name_field + "']",form).val();
	email=$("input[name='" + email_field + "']",form).val();
	phone=$("input[name='" + phone_field + "']",form).val();
	if(type == "infusion" && name === "") name = $("input[name="+name_field2+"]",form).val();
	if(type == "infusion" && email === "") name=$("input[name="+email_field2+"]",form).val();
	if(name.substring(0,6) == "Enter ") {errors += "\nInvalid: Your Name"; }
	if(name === "" || name=="ENTER YOUR NAME"){errors+="\nMissing: Your Name";}
	if(email === "" || email == "ENTER YOUR EMAIL ADDRESS" || email == "Email"){errors+="\nMissing: Your Email";}
	else if(!ValidEmail(email)){errors+="\nInvalid: Your Email";}
	if(phone !== undefined&&phone_optional.length === 0) {
		if(phone === "") {
			errors+="\nMissing: Your Phone";
		} else if(StripNonDigits(phone).length<3) {
			errors+="\nInvalid: Your Phone";
		}
	}
	if(errors !== ""){
		alert(errors.substring(1,errors.length));
		return false;
	}else{
		return true;
	}
}
//pro tab script
function mouseoverbg(div_name){
	$("#"+div_name).css("background","#EE4501");
	$("#"+div_name).css("color","#fff");
}
function mouseoutrbg(div_name){
	$("#"+div_name).css("background","#f3f3f3");
	$("#"+div_name).css("color","#040404");
}
function displaytab(div_name, class_name){
	$("."+class_name).css("display","none");
	$("#"+div_name).css("display","block");
}

(function($) {
    // $(document).ready(function() {
    //     $('form').each(function() {
    //         var self = $(this);
    //         var t = self.find('input[name="custom t"]').val();
    //         var listname = self.find('input[name="listname"]').val();
    //         var username = self.find('input[name="custom users_username"]').val();
    //         var usersid = self.find('input[name="custom users_usersid"]').val();
    //         var landingpage = self.find('input[name="custom landingpage"]').val();
    //         var ty = self.find('input[name="custom ty"]').val();
    //         var refer_url = self.find('input[name="custom refer_url"]').val();
    //         var email = self.find('input[name="from"]');
    //         var email_val = email.val();
    //         var redirect = self.find('input[name="redirect"]');
    //         var redirect_onlist = self.find('input[name="meta_redirect_onlist"]');
    //         // var redirect_val = redirect.val();
    //         var redirect_val = 'http://thesfm.com/' + username + '/redirect.php';
    //         email.on('blur', function(e) {
    //             url = redirect_val + '?email=' + email.val() + '&custom_t=' + t + '&listname=' + listname + '&custom_users_username=' + username + '&custom_usersid=' + usersid + '&custom_landingpage=' + landingpage + '&custom_ty=' + ty + '&custom_refer_url=' + refer_url;
    //             redirect.val(url);
    //             redirect_onlist.val(url);
    //         });
    //     });
    // });
})(jQuery);