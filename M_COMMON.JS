(function ($){
	//begin onload
	$(function(){
		var setTSHeightFunc = function(){
            var menuBackH = $('.menuTS').find('.menuBack').length ? $('.menuTS').find('.menuBack').outerHeight(true) : 0;
	        $('.menuTS .menuList').css({height:($(window).height()-menuBackH)+'px'});
		};
		var setMenuHeightFunc = function($trigger,$target){
			$("html,body").addClass("cmOverflowHide");
            var menuUserConH = $target.find(".menuUserCon").length ? $target.find(".menuUserCon").outerHeight() : 0;
            $target.find(".menuCon").css({height:($(window).height()-menuUserConH)+"px"});
            setTSHeightFunc();
            cateMenuSwiper.onResize();
        };

		egsolUI.showOverlay({
			trigger:$("#menuIcon"),
			target:$("#menuContent"),
			posType:"left",
			speed:500,
			afterShow:setMenuHeightFunc,
			afterHide:function(){
				$("html, body").removeClass("cmOverflowHide");
			},
			onResize:setMenuHeightFunc,
		});
		
		egsolUI.clickShow({
			triggerId:"userIcon",
			targetId:"userContent",
			posType:"bottom_right",
			left:9
		});
		
		egsolUI.switchSite({triggerId:"desktopSwitcher"});

		var cateMenuSwiper = new Swiper('#menuCatScroll', {
	        scrollbar: '.swiper-scrollbar',
	        direction: 'vertical',
	        slidesPerView: 'auto',
	        mousewheelControl: true,
	        freeMode: true,
	        roundLengths : true,
	        onBeforeResize: function(swiper){
	        	var h = $('.menuCat').find('.menuBack').length ? $('.menuCat').find('.menuBack').outerHeight(true) : 0;
	        	$('.menuCatList').css({height:($(".menuCat").height()-h)+'px'});
	        }
	    });

		//click - Categories in menu
		$(".menuNav").on("click", "#menuCat", function(){
			var backTxt = $(".menuCat").find(".menuBackTxt");
			$(".menuPopup").removeClass("none");
			animationEndFn($(".menuCat"), "ani_slideRight");
			$(".menuCat").removeClass("none").find(".menuBackArrow").attr("level", "1");
			backTxt.attr("defaultTxt", backTxt.text());
			cateMenuSwiper.onResize();
		})

		//click - Trade Shows in menu
		$(".menuNav").on("click", "#menuTS", function(){
			$(".menuPopup, .menuTS").removeClass("none");
			animationEndFn($(".menuTS"), "ani_slideRight");
			setTSHeightFunc();
		})

		//animation effect
		var animationEndFn = function($triggerEl, animateCls, callback){
			$triggerEl.addClass(animateCls).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd animationend', function(){
	            $(this).removeClass(animateCls);
	            if(typeof callback == "function"){
	            	callback();
	            }
	        });
		}

		var updateLevel = function(level, backTxt){
			var translateY=0, animateCls;
			if(level == 1){
				$('.menuCat .menuBack').find(".menuBackTxt").text(backTxt);
				translateY = $('.menuCat .menuBack').data('top');
				animateCls = 'ani_slideLeft';
			}else if(level == 2){
				$('.menuCat .menuBack').find(".menuBackTxt").text(backTxt);
		        $('.menuCat .menuBack').data('top', cateMenuSwiper.translate);
		        translateY=0;
				animateCls = 'ani_slideRight';
			}
			$('.menuCat .menuBack').find(".menuBackArrow").attr("level", level);

			//update scroll
			cateMenuSwiper.onResize();
			cateMenuSwiper.setWrapperTranslate(translateY);

			animationEndFn($('.menuCat .menuList'), animateCls);
		};
		$('.menuCat .menuList').on('click', '.arrow', function(){
	        var self = $(this), par = self.closest('li');
	        par.addClass('z_open').siblings('li').addClass('z_close');
	        updateLevel(2, self.next('.cate').text());
	    });
	    // back - Categories
        $('.menuCat').on('click', '.menuBackArrow', function(){
        	var self = $(this), menuCat = self.parents('.menuCat'), defaultTxt = menuCat.find('.menuBackTxt');
        	if(self.attr('level') == 1){
        		self.removeAttr('level');
        		animationEndFn($('.menuCat .menuList'), 'ani_slideLeft');
        		animationEndFn($('.menuCat'), 'ani_slideToRight', function(){
        			$('.menuPopup, .menuCat').addClass('none');
        		});
        	}else if(self.attr('level') == 2){
	        	menuCat.find('.z_open').removeClass('z_open').siblings('li').removeClass('z_close');
	        	updateLevel(1, defaultTxt.attr("defaultTxt"));
        	}
        });
        // back - Trade Shows
        $('.menuTS').on('click', '.menuBackArrow', function(){
			animationEndFn($('.menuTS'), 'ani_slideToRight', function(){
				$('.menuPopup, .menuTS').addClass('none');
			});
        });
		
		function getFormater(qType) {
			if(qType=='PRODUCT') return defaultResultFormater;
			if(qType=='SUPPLIER') return defaultResultFormater;
			return defaultResultFormater;
		}
		var inputTips = {
				'PRODUCT': JSMsg.productTip,
				'SUPPLIER': JSMsg.supplierTip,
		};
		
		function dealGsolquery() {
			var $gsolquery = $("#gsolquery");
			if ($gsolquery.data("hasInitAC")) {
				return;
			}
			var opt = {
				serviceUrl:'/suggest/GeneralManager',
				params: { design:'mobile',page:'commons/autopopkwd',limit:'10',qType:defaultQType, featuredpp:'Y', language:langValue},
				fnFormatResult: getFormater(defaultQType),
				onSelect: function(value){
					/* don't change below method order */ 
					sendAjaxToServer(jQuery('#gsolquery').val(),true,$('#qType').val());
					setApclick("1","T");
					$("#keywordBtnSearch").click();
				}
			}
			var ac = $gsolquery.autocomplete(opt);

			$gsolquery.data('curInputTip', inputTips[defaultQType]);
			egsolUI.customSelect({
				triggerId: 'qTypeSelTrigger',
				targetId: 'qTypeSelTarget',
				optTextShowId: 'qTypeSelTrigger',
				valueInputId: 'qType',
				initValue: defaultQType,
				onchange: function (qType) {
					if(ac) {
						ac.clearCache();
						ac.options.params.qType = qType;
						ac.options.fnFormatResult = getFormater(qType);
					}
					if($gsolquery.val() == $gsolquery.data('curInputTip')) {
						$gsolquery.val(inputTips[qType]);
					}
					$gsolquery.data('curInputTip', inputTips[qType]);
				}
			});
			$gsolquery.data("hasInitAC",true).trigger('blur');
		}
		
		egsolUI.clickShow({
			triggerId:"navSearch",
			targetId:"search",
			afterShow:dealGsolquery,
			disBodyClick:true
		});

		egsolUI.showOverlay({
			trigger:$("#ppSearch"),
			target:$("#searchOverlay"),
			beforeShow:function(){
				$("html,body").addClass("cmOverflowHide");
			},
			afterShow:dealGsolquery,
			afterHide:function($trigger,$target){
				$("html,body").removeClass("cmOverflowHide");
				if($(".autocomplete").is(":visible")){
					$(".autocomplete").hide();
					$("#gsolquery").autocomplete('hide');
				}
			},
		});

		if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
			$("#searchOverlay").on("click", function(event){
				var $target = $(event.target);
				if($(".autocomplete").is(":visible")){
					if( !$target.is("#gsolquery") ){
						$("#gsolquery").autocomplete('hide');
					}
				}
			})
		}

		if($("#ppSearch").length){
			$("#gsolquery").on("keydown", function(){
				if($("#searchOverlay").length && $("#searchOverlay").is(":visible")){
					if( $("#searchOverlay").find(".autocomplete").length == 0 ){
						$('div[id^="AutocompleteContainter_"]').addClass("searchOverlay_pos").appendTo(".searchOverlay_query");
					}
				}
			});
		}

		if($("#exhChx").length>0) {
			$("#exhChx").click(function(){
				var url = window.location.href;
				if(url.indexOf("&exhView=true")>0){
					url = url.replace("&exhView=true", "");
				}

				if(url.indexOf("&prodNo=")>0 || url.indexOf("&suppNo=")>0){
					var str = url.indexOf("&prodNo=")>0 ? url.substring(url.indexOf("&prodNo=")+1) : url.substring(url.indexOf("&suppNo=")+1);
					var params = str.split("&");
					for (var i=0;i<params.length;i++){
						var param=params[i];
						if(param.indexOf("prodNo=")==0 || param.indexOf("suppNo=")==0){
							url = url.replace("&" + param, "");
						}
					}
				}
				
				if($("#exhChx").is(':checked')){
					url = url + "&exhView=true";
				}
				window.location.href = url;
			})
		}

		// set session cookie if user closed the cookie policy tip.
		if ($(".globalTopNotification #globalTopNotification_close")) {
			$(".globalTopNotification #globalTopNotification_close").click(function(){
				setCookie("show.cookie.policy.tip", false);
			})
		}
		$("#exhShortList").click(function(){
			if (typeof getCookie("exh_shortlist_tip") == "undefined") {
				setCookie("exh_shortlist_tip", true, 365);
			}
		})
		$("#exh-appdownload").click(function(){
		     var sUserAgent = navigator.userAgent.toLowerCase();
             var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os"; 
             var bIsAndroid = sUserAgent.match(/android/i) == "android";
             var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
			 if(bIsAndroid){
		         dcsMultiTrack('DCS.dcsuri', '/AppStoreButton.htm', 'WT.ti', 'Mobile Site App Store Icon', 'WT.source', 'Mobile Site App Store Icon', 'WT.cg_n', 'Mob Android Icon', 'WT.cg_s', 'Shortlist Exh Popup', 'WT.dl', '99');
			 } else if(bIsIphoneOs||bIsIpad){
				 dcsMultiTrack('DCS.dcsuri', '/AppStoreButton.htm', 'WT.ti', 'Mobile Site App Store Icon', 'WT.source', 'Mobile Site App Store Icon', 'WT.cg_n', 'Mob IOS Icon', 'WT.cg_s', 'Shortlist Exh Popup', 'WT.dl', '99');
	         } else{
				 console.log("error::: cannot identify the type of the device - " + sUserAgent);
			 }
			 window.location.href="http://mobileapi.globalsources.com/scan.jsp?appId=2";
		});
		
		initMessageCount();        
      // notification panel
		if ($("#msgPanelOverlay").length) {
			var $noticePanel = $("#msgPanelOverlay");
			var autoshowCookieName = "notif_panel_auto_displayed_m";
			var refreshFlag = true;
			
			// custom events
			$noticePanel.on("refresh", function(event){
				// show loading
				$noticePanel.trigger("showText", $("message#JSMsg_Loading").attr("value"));
				// validate cookie
				if (typeof getCookie("rem_me") == "undefined") {
					$noticePanel.trigger("showText", $("message#JSMsg_NoNewMsg").attr("value"));
					return;
				}
								
				$.ajax({
					url: "/gsol/mobile/messageNotification.do",
					method: "get",
					dataType: "json",
					async: true,
					cache: false,
					data: {alertType:"PANEL"}
					//
				}).done(function(data, textStatus, jqXHR) {
					var messages = data["messages"];
					if (typeof messages != "undefined" && messages != null) {
						// no new message
						if (Object.keys(messages).length < 1) {
							$noticePanel.trigger("showText", $("message#JSMsg_NoNewMsg").attr("value"));
						}
						// have new message
						else {
							var $msgSec = $noticePanel.find(".msgPanel_ul");
							$msgSec.removeClass("msgPanel_noMsg");
							$msgSec.find("li").remove();
							$.each(messages, function(i, msg) {
								var msgHtml = $("#notiMsg_tmpl").html();
								$.each(msg, function(k, v){
									msgHtml = msgHtml.replace(new RegExp('\\['+k+'\\]', 'gm'), v);
								});
								$msgSec.append(msgHtml);
							});
							// bind on-click event on each message
							$msgSec.find("li").click(function(){
								$("#ui_overlay_baselay").click();
								if (typeof dcsMultiTrack == "function") { dcsMultiTrack('DCS.dcsuri','/OnsiteNotification.htm','WT.ti','Buyer Profile','WT.cg_n','Notification Panel','WT.cg_s','Click Message','WT.source','Mobile Pgs','WT.dl','22'); }
							});
							// trigger displaying of notification panel if it's hidden
							if ($noticePanel.is(":hidden")) {
								refreshFlag = false;
								$("#msgIcon").click();
							}
						}
					} else {
						$noticePanel.trigger("showText", $("message#JSMsg_NoNewMsg").attr("value"));
					}
					//
				}).fail(function(jqXHR, textStatus, errorThrown) {
					// exception handling: show no new message
					$noticePanel.trigger("showText", $("message#JSMsg_NoNewMsg").attr("value"));
					//console.log("Failed to refresh notification panel");
					//
				}).always(function() {
					// complete
				});
				//
			}).on("showText", function(event, text){
				var $msgSec = $(this).find(".msgPanel_ul");
				$msgSec.find("li").remove();
				$msgSec.append("<li>" + text + "</li>");
				$msgSec.addClass("msgPanel_noMsg");
			});
			// notification panel - overlay
			var setMsgHeightFunc = function($trigger,$target){
				$target.find(".msgPanel_con").css({height:($(window).height()-$target.find(".msgPanel_tit").outerHeight())+"px"});
				msgPanelSwiper.onResize();
				// check refresh flag
				if (refreshFlag) {
					// get latest message(s)
					$noticePanel.trigger("refresh");
				} else {
					refreshFlag = true;
				}
				// webtrends tracking
				if (typeof dcsMultiTrack == "function") { dcsMultiTrack('DCS.dcsuri','/OnsiteNotification.htm','WT.ti','Buyer Profile','WT.cg_n','Notification Panel','WT.cg_s','Display','WT.source','Mobile Pgs','WT.dl','22'); }
			};
			var sendDcs = function($trigger,$target){
			// bind on-click event on view more link
				$target.find(".msgPanel_viewMore > a").click(function(){
					$("#ui_overlay_baselay").click();
					if (typeof dcsMultiTrack == "function") { dcsMultiTrack('DCS.dcsuri','/OnsiteNotification.htm','WT.ti','Buyer Profile','WT.cg_n','Notification Panel','WT.cg_s','Click Message-all','WT.source','Mobile Pgs','WT.dl','22'); }
				});
			}
			egsolUI.showOverlay({
				trigger:$("#msgIcon"),
				target:$("#msgPanelOverlay"),
				posType:"right",
				speed:500,
				beforeShow:sendDcs,
				afterShow:setMsgHeightFunc,
				onResize:setMsgHeightFunc,
			});
			egsolUI.showOverlay({
				trigger:$("#ppMsg"),
				target:$("#msgPanelOverlay"),
				beforeShow:sendDcs,
				afterShow:setMsgHeightFunc,
				onResize:setMsgHeightFunc,
			});
			
			// notification panel swiper
			var msgPanelSwiper = new Swiper('#msgPanel_scroll', {
				scrollbar: '.swiper-scrollbar',
				direction: 'vertical',
				slidesPerView: 'auto',
				mousewheelControl: true,
				freeMode: true,
				roundLengths : true
			});
			
			// auto-display notification panel on the 1st page load in session
			if (!getCookie(autoshowCookieName)) {
				// get latest message(s)
				$noticePanel.trigger("refresh");
				// set session cookie
				setCookie(autoshowCookieName, true);
			}
		}
		
		// message floating alert (shows up only when global nav exists)
		if ($(".menu").length && $("float-alert").length) {
			// start polling new message
			if ($("float-alert").attr("state").toLowerCase() == "on") {
				pushNewMessage();
				polling = setInterval(pushNewMessage, 3*60*1000);
			}
		}
		
		if(window.AutocompleteHelper && ($("#gsolquery").length>0 || $("#gsolquery2").length>0)) {
			var defaultResultFormater = window.AutocompleteHelper.defaultResultFormater;
			
			var defaultQType = 'PRODUCT';
			var $pageType = $("#KWSearchType");
			if($pageType && $pageType.val() == 'SuppSearch'){
				defaultQType = 'SUPPLIER';
			}
		
			var langValue = $("#language").val();
			if (langValue == null || '' == langValue){
				langValue = 'en';
			}
	
			if($("#gsolquery").length>0 && !$("#gsolquery").is(":hidden")) {
				dealGsolquery();
			}		
			
			if($("#gsolquery2").length>0) {
				var $gsolquery2 = $("#gsolquery2");
				var opt2 = {
					serviceUrl:'/suggest/GeneralManager',
					params: { design:'mobile',page:'commons/autopopkwd',limit:'10',qType:defaultQType, featuredpp:'Y', language:langValue},
					fnFormatResult: getFormater(defaultQType),
					onSelect: function(value){
						/* don't change below method order */ 
						sendAjaxToServer(jQuery('#gsolquery2').val(),true,$('#qType2').val());
						setApclick("2","T");
						$("#keywordBtnSearch2").click();
					}
				}
				var ac2 = $gsolquery2.autocomplete(opt2);
				

				$gsolquery2.data('curInputTip', inputTips[defaultQType]);
				egsolUI.customSelect({
					triggerId: 'qTypeSelTrigger2',
					targetId: 'qTypeSelTarget2',
					optTextShowId: 'qTypeSelTrigger2',
					valueInputId: 'qType2',
					initValue: defaultQType,
					onchange: function (qType) {
						if(ac2) {
							ac2.clearCache();
							ac2.options.params.qType = qType;
							ac2.options.fnFormatResult = getFormater(qType);
						}
						if($gsolquery2.val() == $gsolquery2.data('curInputTip')) {
							$gsolquery2.val(inputTips[qType]);
						}
						$gsolquery2.data('curInputTip', inputTips[qType]);
					}
				});
			}
			
			$("#gsolquery,#gsolquery2").bind('focus',function(){
				var $this = $(this);
				if($this.val() == $this.data('curInputTip')) {
					$this.val('').focus();
				}
				$this.removeClass('inputTip');
			}).bind('blur',function(){
				var $this = $(this);
				if($this.val() == '') {
					$this.addClass('inputTip');
					$this.val($this.data('curInputTip'));
				}
			}).trigger('blur');
		}
		getCountryName();	
		
		
		//move from inline script begin
		$(window).resize(function () {
			if (document.getElementById("autoSuggestionId") != undefined) {
				if (document.getElementById("autoSuggestionId").style.display == 'block') {
					if (document.getElementById("gsolquery2") != undefined) {
						$('#autoSuggestionId').css("width", $('#gsolquery2').css("width"));
					} else {
						if (document.getElementById("gsolquery") != undefined) {
							$('#autoSuggestionId').css("width", $('#gsolquery').css("width"));
						}
					}
				}
			}
		});
		$(document).ready(function () {
			$("#qTypeSelTarget li").click(function () {
				var val = $(this).attr("optionval");
				if ("SUPPLIER" == val) {
					$("#searchBoxForm").attr("action", "https://m.globalsources.com/gsol/mobile/supplierSearchResult.do");
				} else if ("PRODUCT" == val) {
					$("#searchBoxForm").attr("action", "https://m.globalsources.com/gsol/mobile/productSearchResult.do");
				}
			});
		});
		//move from inline script end
		
	});
	//end onload
})(jQuery);
//MR51567
getCountryName=function(){
	//alert("getCountryName");
		var countryName;
			$.ajax({ url: '/gsol/GeneralManager?page=geoipCheck&type=CountryFrom', async: false, type: 'GET', dataType: "xml", success: function(xml){
				countryName = $(xml).find('geoIPCountry').text();
				//alert("countryName :: "+countryName);
			} });
			
			return countryName;
};
//FOR message count number init on header
initMessageCount = function(){
    var fakeDiv = $("#fakeDiv");
	var reqId = fakeDiv.attr("reqID");
	var countnumDiv = $("#msgIcon");
	if(countnumDiv && reqId){
		var $this = $("#msgIcon em,#messageNoficationCount");
		var mesgCountURL="";
        if (typeof dajax == "undefined")
		    mesgCountURL="/gsol/GeneralManager?action=GetMessageCount&ldapId=" + reqId;
		else
			mesgCountURL="/ajaxcalls/GeneralManager?action=GetMessageCount&snippets=ajax&ldapId=" + reqId;

		$.ajax({
			url: mesgCountURL,
			success: function(data) {
				if(data && data[0]){
					if(parseInt(data[0].notificationCount)>99){
						$this.html('99+');
					}else{
						$this.html(data[0].notificationCount);
					}
				}
			},
			error: function(e){
				console.log(e);
			}
		});
	}
};

function showNewMessageAlert() {
	if (typeof dcsMultiTrack == "function") { dcsMultiTrack('DCS.dcsuri','/OnsiteNotification.htm','WT.ti','Buyer Profile','WT.cg_n','Floating Alert','WT.cg_s','Display','WT.source','Mobile Pgs','WT.dl','22'); }
	// floating alert
	var stopTime = null;
	var setPosVal = $(".floatAlert").outerHeight();
	$(".floatAlert").css("top", -setPosVal + "px").show().animate({top:0}, 1000);
	stopTime = setTimeout(function(){
		$(".floatAlert").animate({opacity:0}, 3000, function(){
			$(this).remove();
		})
	}, 5000)
	$(".floatAlert_close").click(function(){ // close the floating alert
		clearTimeout(stopTime);
		$(this).parents(".floatAlert").remove();
	})

	$(".floatAlert_txt > a").click(function(){
		if (typeof dcsMultiTrack == "function") { dcsMultiTrack('DCS.dcsuri','/OnsiteNotification.htm','WT.ti','Buyer Profile','WT.cg_n','Floating Alert','WT.cg_s','Click Message'+($(".floatAlert").data("newMessageCount")>1?"-All":""),'WT.source','Mobile Pgs','WT.dl','22'); }
		$(".floatAlert_close").click();
	});
}
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return decodeURIComponent(y);
		}
	}
}

function setCookie(c_name,value,expiredays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	var domain = location.host;
	document.cookie=c_name+ "=" +value+";domain="+domain.substring(domain.indexOf(".globalsources."))+";path=/"+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}

//var polling;
function pushNewMessage() {
	// validate cookie
	if (typeof getCookie("rem_me") == "undefined") {
		if (typeof polling != "undefined") {
			clearInterval(polling);
		}
		return;
	}
	$.ajax({
		url: "/gsol/mobile/messageNotification.do",
		method: "get",
		dataType: "json",
		cache: false,
		async: true,
		data: {alertType:"SINGLE"}
		//
	}).done(function(data, textStatus, jqXHR) {
		var messages = data["messages"];
		if (typeof messages != "undefined" && messages != null) {
			// have new message
			if (Object.keys(messages).length > 0) {
				// create floating alert element
				var alert = messages[0];
				var alertHtml = $("#floatAlert_tmpl").html();
				$.each(alert, function(k, v){
					alertHtml = alertHtml.replace(new RegExp('\\['+k+'\\]', 'gm'), v);
				});
				$("#floatAlert_tmpl").after(alertHtml);
				$(".floatAlert").data("newMessageCount", alert["newMessageCount"]);
				// display floating alert
				showNewMessageAlert();
			}
		}
		//
	}).fail(function(jqXHR, textStatus, errorThrown) {
		//console.log("Failed to get new message");
		//
	}).always(function() {
		// complete
	});
}
function setUpHeaderSearch() {
	var myVal = "";//document.searchbox.search_what[document.searchbox.search_what.selectedIndex].value;
	//add below for project v201
    if(jQuery('#qType').val()){
    	var qType = jQuery('#qType').val();
		myVal = (qType == 'PRODUCT') ? "1" : (qType == 'SUPPLIER' ? "2" : "3");
	} else if(jQuery('#ME_qType').val()){
    	var qType = jQuery('#ME_qType').val();
		myVal = (qType == 'PRODUCT') ? "1" : (qType == 'SUPPLIER' ? "2" : "3");
	}
	//end project v201
	if(document.searchbox.KWSearchType){
		document.searchbox.removeChild(document.searchbox.KWSearchType);
	}
	var KWSearchType = document.createElement("input");
	KWSearchType.setAttribute("type", "hidden");
	KWSearchType.setAttribute("name", "KWSearchType");
	//add below for project v22
	var isFromKiosk = matchCookie("TS_ID","INQ_PATH_VALUE","TS_Kiosk");
	if(isFromKiosk){
	  if (typeof document.searchbox.exh == "undefined")
		  makeInputElement(document.searchbox,'hidden','exh','true');
	  if(typeof document.searchbox.isKiosk == "undefined")
			 makeInputElement(document.searchbox,'hidden','isKiosk','Y');
	}
	//end project v22
	if(myVal == "1"){//for product search display supplier list as default tab
		if (typeof document.searchbox.view == "undefined")
    		makeInputElement(document.searchbox,'hidden','view','grid');
		
    	if(document.getElementById("apclick") && "T"==document.getElementById("apclick").value)
    		KWSearchType.setAttribute("value", "Prod_Autocomplete_Search");
    	else         
    		KWSearchType.setAttribute("value", "ProdSearch");   
        
	} else { //clear values if not a product search
		if(myVal == "2"){
	    	if(document.getElementById("apclick") && "T"==document.getElementById("apclick").value)
	    		KWSearchType.setAttribute("value", "Supp_Autocomplete_Search");
	    	else{
	    		KWSearchType.setAttribute("value", "SuppSearch");
	    		if (typeof document.searchbox.view == "undefined")
	    		makeInputElement(document.searchbox,'hidden','view','suppList');
	    	}
		}else if(myVal == "3"){
	    	if(document.getElementById("apclick") && "T"==document.getElementById("apclick").value)
	    		KWSearchType.setAttribute("value", "Article_Autocomplete_Search");
	    	else 			
	    		KWSearchType.setAttribute("value", "ArticleSearch");
		}
		if (document.searchbox.supp_list!=null)
			document.searchbox.supp_list.value = "";
		if (document.searchbox.compare_table!=null)
			document.searchbox.compare_table.value = "";
	}
	document.searchbox.appendChild(KWSearchType);
	if(document.getElementById("apclick")) document.getElementById("apclick").value = '';
	matchKW();
	submitHeaderSearch();
}
	
function makeInputElement(formObj,elemType,elemName,elemVal) {
	aNode = document.createElement('Input');
	aNode.setAttribute('type', elemType);
	aNode.setAttribute('name', elemName);
	aNode.setAttribute('value', elemVal);
	formObj.appendChild(aNode);
}

function matchKW(){
	var query=document.searchbox.query.value;
	var appKw=jQuery("#apkw").val();
	if(query!=''){
		if(appKw==query){
			jQuery("#apmatch").val("T");
			}else{
				jQuery("#apmatch").val("F");
				}
	}
}

var gsol_root_id = "3000000149681";
var gsol_cat_id = "2000000003844";
var selected_prod_id = "";
var selected_catalog_id = "2000000003844";
var currentCatalogId = "2000000003844";

function submitHeaderSearch() {
	if (document.searchbox.query.value == "" || document.searchbox.query.value == JSMsg.productTip || document.searchbox.query.value == JSMsg.supplierTip || document.searchbox.query.value.length ==1) { 
		alert('Please enter minimum 2 characters to start your search');
	} else {
		makeSearchActionFields(document.searchbox);
		var myVal = "";//document.searchbox.search_what.value;
		//add below for project v201
	    if(jQuery('#qType').val()){
	    	var qType = jQuery('#qType').val();
			myVal = (qType == 'PRODUCT') ? "1" : (qType == 'SUPPLIER' ? "2" : "3");
		} else if(jQuery('#ME_qType').val()){
	    	var qType = jQuery('#ME_qType').val();
			myVal = (qType == 'PRODUCT') ? "1" : (qType == 'SUPPLIER' ? "2" : "3");
		}
		//end project v201
		if (myVal == "1") {
			setSearchValues("PRODUCT",document.searchbox);
		} else if (myVal == "2") {
			setSearchValues("SUPPLIER",document.searchbox);
		}
		if((selected_prod_id != "") && (selected_prod_id != "-1")) {
			makeInputElement(document.searchbox,'hidden','prod_id',selected_prod_id);
		}
		document.searchbox.query.value = ($.trim(document.searchbox.query.value));
		document.searchbox.query.value = document.searchbox.query.value.replace(/\s+/g, ' ');
		document.searchbox.submit();
	}
}

function makeSearchActionFields(formObj) {
	if (typeof formObj.action == "string") {
		makeInputElement(formObj,'hidden','action','GetPoint');
		makeInputElement(formObj,'hidden','action','DoFreeTextSearch');
	}
}

function matchCookie(tsid,cookieName,cookieValue)
{ 
 var arr1,reg1 = new RegExp("(^| )"+tsid+"=([^;]*)(;|$)");
 var arr2,reg2 = new RegExp("(^| )"+cookieName+"=([^;]*)(;|$)");
 if(arr1 = document.cookie.match(reg1)){
	if(arr1[2].length>0){
		if(arr2 = document.cookie.match(reg2)){
			if($.trim(arr2[2]) == cookieValue){
				return true;
			}else{
				return false;
			}
		}
	}else{
		return false;
	}
 }else{
  return false;
 }
}

function setSearchValues(srchType,formObj) {
	//add below for project v22
	var isFromKiosk = matchCookie("TS_ID","INQ_PATH_VALUE","TS_Kiosk");
	if(isFromKiosk){
	  if (typeof formObj.exh == "undefined")
		  makeInputElement(formObj,'hidden','exh','true');
	  if(typeof formObj.isKiosk == "undefined")
			 makeInputElement(formObj,'hidden','isKiosk','Y');
	}
	// end project v22
	
	if (srchType == "PRODUCT") {
		if ((formObj.AGG != null) && formObj.AGG.value == "Y")
			formObj.point_search.value='off';
		else
			formObj.point_search.value='on';

		formObj.page.value = 'search/ProductSearchResults';
		formObj.product_search.value="on";
		formObj.supplier_search.value="off";

		if (typeof formObj.view == "undefined")
		makeInputElement(formObj,'hidden','view','grid');
		
	} else if (srchType == "SUPPLIER") {
		if ((formObj.AGG != null) && formObj.AGG.value == "Y")
			formObj.point_search.value='off';
		else
			formObj.point_search.value='on';

		formObj.page.value = 'search/SupplierSearchResults';
		formObj.supplier_search.value="on";
		formObj.product_search.value="off";

		if (formObj.supp_list!=null)
			formObj.supp_list.value = "";
		if (formObj.compare_table!=null)
			formObj.compare_table.value = "";

	} 
}

function setApclick(whichForm,val){
	//add for PA homepage--project v201
	var formObj =  document.searchbox;
	if(formObj && document.searchbox.length == 2)
		formObj = document.searchbox[0];
	//end add
	
	if(formObj && formObj.apclick){
		formObj.removeChild(formObj.apclick);
	}
	
	if(document.searchboxInAll && document.searchboxInAll.apclick){
		document.searchboxInAll.removeChild(document.searchboxInAll.apclick);
	}
	
	if("2"==whichForm)//bottom search box
		formObj = document.searchboxInAll;
	if("3"==whichForm)//bottom search box
		formObj = document.pasearchbox
	var apclick = document.createElement("input");
	apclick.setAttribute("type", "hidden");
	apclick.setAttribute("name", "apclick");
	apclick.setAttribute("id", "apclick");
	apclick.setAttribute("value", val);        

	formObj.appendChild(apclick);
}

function submitSearchInAll2(){
	if (document.searchboxInAll.query.value == "" || document.searchboxInAll.query.value ==JSMsg.productTip || document.searchboxInAll.query.value == JSMsg.supplierTip || document.searchboxInAll.query.value.length ==1) { 
		alert('Please enter minimum 2 characters to start your search');
	} else {
		if(document.searchboxInAll.KWSearchType){
			document.searchboxInAll.removeChild(document.searchboxInAll.KWSearchType);
		}
		var KWSearchType = document.createElement("input");
		KWSearchType.setAttribute("type", "hidden");
		KWSearchType.setAttribute("name", "KWSearchType");
		
		var myVal = "1";//document.searchbox.search_what.value;
		//add below for project v201
	    if(jQuery('#qType2').val()){
	    	var qType = jQuery('#qType2').val();
			myVal = (qType == 'PRODUCT') ? "1" : (qType == 'SUPPLIER' ? "2" : "3");
		}
		//end project v201			
		
		if (myVal == "1") {
			setSearchValues("PRODUCT",document.searchboxInAll);
	    	if(document.getElementById("apclick") && "T"==document.getElementById("apclick").value)
	    		KWSearchType.setAttribute("value", "Prod_Autocomplete_Search");
	    	else 
				KWSearchType.setAttribute("value", "ProdSearch");
		} else if (myVal == "2") {
			setSearchValues("SUPPLIER",document.searchboxInAll);
	    	if(document.getElementById("apclick") && "T"==document.getElementById("apclick").value)
	    		KWSearchType.setAttribute("value", "Supp_Autocomplete_Search");
	    	else
				KWSearchType.setAttribute("value", "SuppSearch");
		} 
		document.searchboxInAll.appendChild(KWSearchType);
		if(document.getElementById("apclick")) document.getElementById("apclick").value = '';
		var query=document.searchboxInAll.query.value;
		var appKw=jQuery("#apkw2").val();
		if(query!=''){
			if(appKw==query){
				jQuery("#apmatch2").val("T");
			}else{
				jQuery("#apmatch2").val("F");
			}
		}
		document.searchboxInAll.query.value = ($.trim(document.searchboxInAll.query.value));
		document.searchboxInAll.query.value = document.searchboxInAll.query.value.replace(/\s+/g, ' ');
		document.searchboxInAll.submit();
	}
}

//move from inline script begin

var basket = (function () {
	return {
		updateStatus: function (page) {
			var el = arguments[2];
			var productId = arguments[1];
			if ($(el).find("i").hasClass("saveIcon")) {
				var ids = [];
				ids.push(parseInt(arguments[1]));
				var updateBasketURL = "";
				if (page == "pp") {
					updateBasketURL = "/gsol/GeneralManager?action=AddInquiryItem&isRefresh=false&product_id=" + ids;
				}
				if(page == "supplier_homepage"){
					updateBasketURL = "/gsol/GeneralManager?action=AddInquiryItem&isRefresh=false&supplier_id=" + ids;
				}

				$.ajax({
					url: updateBasketURL,
					success: function (data) {
						if (data && !isNaN(parseInt(data))) {
							var button = $(el);
							if (button.html() != null) {
								if (page == "pp") {
									var parent = button.parents(".majorPP");
									parent.find("input[name=product_id]").hide();
								}
								if(page == "supplier_homepage"){
									var parent = button.parents(".supplierInfo");
									parent.find("input[name=supplier_id]").hide();	
								}								

								var oldhtml = button.html();
								var updatedhtml = oldhtml.replace(new RegExp(JSMsg.addbsk_onerow + "$", 'g'), JSMsg.addedbsk_onerow).replace(new RegExp(JSMsg.addbsk + "$", 'g'), JSMsg.addedbsk).replace("saveIcon", "savedIcon");
								button.html(updatedhtml);
								if ($("#navcount").length == 0) {
									$(".saveIcon").after("<strong id=\"navcount\">" + parseInt(data) + "</strong>");
								} else {
									$("#navcount").html(parseInt(data));
								}
							}
						}
					},
					error: function (e) {
						console.log(e);
					}
				});
			} else {
				var ids = [];
				ids.push(parseInt(arguments[1]));
				var updateBasketURL = "";
				if (page == "pp") {
					updateBasketURL = "/gsol/GeneralManager?action=DelInquiryItem&design=mobile&isRefresh=false&inquiry_path=InquireNow_Basket&product_id=" + ids;
				}
				if(page == "supplier_homepage"){
					updateBasketURL = "/gsol/GeneralManager?action=DelInquiryItem&design=mobile&isRefresh=false&inquiry_path=InquireNow_Basket&supplier_id="+ ids;
				}		

				$.ajax({
					url: updateBasketURL,
					success: function (data) {

						var button = $(el);

						if (button.html() != null) {
							if (page == "pp") {
								var parent = button.parents(".majorPP");
								parent.find("input[name=product_id]").hide();
							}
							if(page == "supplier_homepage"){
								var parent = button.parents(".supplierInfo");
								parent.find("input[name=supplier_id]").hide();	
							}	

							var oldhtml = button.html();
							var updatedhtml = oldhtml.replace(new RegExp(JSMsg.addbsk_onerow + "$", 'g'), JSMsg.addedbsk_onerow).replace(new RegExp(JSMsg.addbsk + "$", 'g'), JSMsg.addedbsk).replace("savedIcon", "saveIcon");
							button.html(updatedhtml);
							if ($("#navcount").length == 0) {
								$(".saveIcon").after("<strong id=\"navcount\"></strong>");
							} else {
								$("#navcount").html(parseInt(data));
							}
						}

					},
					error: function (e) {
						console.log(e);
					}
				});
			}
		}
	};
})();

var sUserAgent = navigator.userAgent.toLowerCase();
var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
var bIsAndroid = sUserAgent.match(/android/i) == "android";
var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
if (bIsAndroid) {
	$('#apple').hide();
}
if (bIsIphoneOs || bIsIpad) {
	$('#android').hide();
}

if($("#navigateFlag").attr("data")=="false") {
    setCookie("show.cookie.policy.tip","true");
} else if ($("#navigateFlag").attr("data")=="true"){
    setCookie("show.cookie.policy.tip","false");
} else {
}
//move from inline script end
