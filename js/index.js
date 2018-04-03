$(function(){

	var viewWidth = $(window).width();
	var viewHeight = $(window).height();
    var desWidth = 640;
	var touchstart = 'touchstart';
	var touchmove = 'touchmove';
	var touchend = 'touchend';
	var id = -1;

	var index = 0;
	var oAudio = $('#audio1').get(0);

	var $main = $('#main');
	var $listContentUl = $('#listContentUl');
	var $listTitle = $('#listTitle');
	var $listContent = $('#listContent'); 
	var $listAudio = $('#listAudio');
	var $listAudioImg = $('#listAudioImg');
    var $listAudioText = $('#listAudioText');
	var $listAudioBtn = $('#listAudioBtn');

	var $left = $('#left');

	var $musicDetails = $('#musicDetails');
	var $detailsTitle = $('#detailsTitle');
	var $detailsName = $('#detailsName');

    var $musicDetails = $('#musicDetails');
	var $detailsTitle = $('#detailsTitle');
	var $detailsName = $('#detailsName');
	var $detailsAudioProUp = $('#detailsAudioProUp');
	var $detailsAudioProBar = $('#detailsAudioProBar');
	var $detailsNowTime = $('#detailsNowTime');
	var $detailsAllTime = $('#detailsAllTime');
	var $detailsPlay = $('#detailsPlay');
	var $detailsPrev = $('#detailsPrev');
	var $detailsNext = $('#detailsNext');
	var $detailsLyricUl = $('#detailsLyricUl');

	function init(){   //整个项目的初始化
		device();
		musicList.init();
		musicDetails.init();
	}
			
	function device(){   //兼容PC和移动端
		//console.log( navigator.userAgent );
		var isMobile = /Mobile/i.test(navigator.userAgent);
		if(viewWidth > desWidth){
			$main.css('width','640px');
		}
		if(!isMobile){
			touchstart = 'mousedown';
			touchmove = 'mousemove';
			touchend = 'mouseup';
		}

	}

	var musicList = (function(){	//音乐列表

		var downY = 0;
		var downT = 0;
		var parentH = $listContent.height();
		var childH = $listContentUl.height();
		var onoff1 = true;
		var onoff2 = true;
	    var onoff3 = true;
		var timer = null;
		var speed = 0;

		function init(){ 
			data();
			bind();
			moveScroll();
								
		}
	    function data(){
			$.ajax({
			    url:'data.json',
			    type:'GET',
			    dataType:'json',
				success:function(data){
					// console.log(data);
				var $li;
				$.each(data.musicList,function(i,obj){

					$li = '<li musicId="'+(obj.Id)+'"><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.singerName)+'</p></li>';
					$listContentUl.append($li);
				});
			    childH = $listContentUl.height();
											
				},
			    error:function(error){
					console.log(error);
				}
			})
		}

	function bind(){	//事件
		// $listTitle.on(touchstart,function(){
		// 	window.location = '';
		// 	});						
		$listContentUl.delegate('li',touchend,function(){
			if(onoff3){
				$(this).attr('class','active').siblings().attr('class','');
				id = $(this).attr('musicId');
				musicAudio.loadMusic(id);
				index = $(this).index();
				}					
			});	
		$listAudio.on(touchstart,function(){
			if(id>=0){
					musicDetails.sildeUp();
			}
		});					

					
	}

	function moveScroll(){ //滑动列表
		$(document).on(touchmove,function(ev){
			ev.preventDefault();
		});

		$listContentUl.on(touchstart,function(ev){
			if(parentH>childH){return false;}
			var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
			var This = this;
			downY = touch.pageY;
			downT = $(this).position().top;
			onoff1 = true;
			onoff2 = true;
			onoff3 = true;
			clearInterval(timer);

			$(document).on(touchmove+'.move',function(ev){
				onoff3 = false;
				var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
				var iTop = $(This).position().top;
				if(iTop>=0){
					if(onoff1){
						onoff1 = false;
						downY = touch.pageY;
					}
					$(This).css('transform','translate3d(0,'+(touch.pageY - downY)/3+'px,0)');

					}else if(iTop<=parentH-childH){
						if(onoff2){
							onoff2 = false;
							downY = touch.pageY;
						}
						$(This).css('transform','translate3d(0,'+((touch.pageY - downY)/3+(parentH-childH))+'px,0)');
					}else{
						$(This).css('transform','translate3d(0,'+(touch.pageY - downY + downT)+'px,0)');
						}
										
					});
		$(document).on(touchend+'.move',function(ev){
			$(this).off('.move');

			if(!onoff3){
				clearInterval(timer);
			    timer = setInterval(function(){
				var iTop = $(This).position().top;
				if(Math.abs(speed) <= 1 || iTop > 50 || iTop < parentH - childH - 50){
					clearInterval(timer);
					if(iTop >= 0){
					    $(This).css('transition','.2s');
						$(This).css('transform','translate3d(0,0,0)');
					}
					else if(iTop <= parentH - childH){
						$(This).css('transition','.2s');
						$(This).css('transform','translate3d(0,'+(parentH - childH)+'px,0)');
						}
					}
					else{
						speed *= 0.9;
						$(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
						}
								
		           },13);

		        }
							
			});
            return false;
		});
		$listContentUl.on('transitonend webkitTransitionEnd',function(){
				$(this).css('transition','');
			});

		}

		function show(musicName,singerName,img){ //显示
			$listAudioImg.attr('src','img/'+img);
			$listAudioText.find('h3').html(musicName);
			$listAudioText.find('p').html(singerName);
			$listAudioBtn.show();
		}

		return {
		    init:init,
		    show:show
		};
	})();

		var musicDetails = (function(){	//音乐详情页操作
			var re = /\[[^[]+/g;
			var arr = [];
			var $li = null;
			var iLiH = 0;
			function init(){
				$musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
				bind();
			}
			function sildeUp(){	//向上展开
				$musicDetails.css('transition','.5s');
				$musicDetails.css('transform','translate3d(0,0,0)');
			}
			function sildeDown(){	//向下收缩
				$musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
			}
			function bind(){
				$detailsTitle.on(touchstart,function(){
					sildeDown();
				})
			}

		function show(musicName,singerName,sLyric){  //显示
				$detailsName.html(musicName+'<span>'+singerName+'</span>');
				$detailsLyricUl.empty().css('transform','translate3d(0,0,0)');
				 // console.log(sLyric);
				 arr = sLyric.match(re);
				 // console.log(arr);
				 for(var i = 0;i<arr.length;i++){
				 	arr[i] = [formatTime(arr[i].substring(0,10)),arr[i].substring(10).trim()];
				 }
				 for(var i=0;i<arr.length;i++){
				 	$detailsLyricUl.append('<li>'+arr[i][1]+'</li>');
				 }
				 $li = $detailsLyricUl.find('li');
				 // console.log($li.length);
				 $li.first().attr('class','active');
				 iLiH = $li.first().outerHeight(true);
		}

		function formatTime(num){
			num = num.substring(1,num.length-1);
			var arr = num.split(':');
			return (parseFloat(arr[0]*60)+parseFloat(arr[1])).toFixed(2);
		}

		function scrollLyric(ct){ //滚动歌词
			// console.log(ct);
			for(var i=0;i<arr.length;i++){
				if(i!=arr.length-1 && ct>arr[i][0] && ct<arr[i+1][0]){
					$li.eq(i).attr('class','active').siblings().attr('class','');
					if(i>3){
						$detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
					}
				}else if(i == arr.length-1 && ct>arr[i][0]){
					$li.eq(i).attr('class','active').siblings().attr('class','');
					$detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
				}
			}
 		}
			return{
				init:init,
				sildeUp: sildeUp,
				show:show,
				scrollLyric:scrollLyric
			} 
			
		})();

		var musicAudio = (function(){ //音乐播放器操作
			var onoff = true;
			var timer = null;
			var scale = 0;
			var diX = 0;
			var parentW = $detailsAudioProBar.parent().width();
			function init(){ //初始
				bind();
			}
			function loadMusic(id){
				$.ajax({
					url:'data.json',
					type:'GET',
					dataType:'json',
					success:function(data){
						// console.log(data.musicList[id]);
						show(data.musicList[id]);
					},
					error:function(error){
						console.log(error);
					}
				});
			}

			function show(obj){ //显示
				var musicName = obj.musicName;
				var singerName = obj.singerName;
				var img = obj.img;
				var audio = obj.audio;
				var sLyric = obj.sLyric;
				musicList.show(musicName,singerName,img);
				musicDetails.show(musicName,singerName,sLyric);
				oAudio.src = 'img/'+audio;
				$(oAudio).one('canplaythrough',function(){
					play();
					$detailsAllTime.html(formatTime(oAudio.duration));
				});
				$(oAudio).one('ended',function(){
					next();
				});
			}

			function play(){ //播放
				onoff = false;
				$listAudioImg.addClass('move');
				$listAudioBtn.css('backgroundImage','url(img/list_audioPause.png)')
				$detailsPlay.css('backgroundImage','url(img/details_pause.png)');
				oAudio.play();
				playing();
				clearInterval(timer);
				timer = setInterval(playing,1000);
			}

			function pause(){	//暂停
				onoff = true;
				$listAudioImg.removeClass('move');
				$listAudioBtn.css('backgroundImage','url(img/list_audioPlay.png)');
				$detailsPlay.css('backgroundImage','url(img/details_play.png)');
				oAudio.pause();
				clearInterval(timer);
			}

	function bind(){  //事件
				
	$listAudioBtn.add($detailsPlay).on(touchstart,function(){
		if(onoff){
			play();
		}else{
			pause();
		}
		return false;
	});

		$detailsAudioProBar.on(touchstart,function(ev){
				var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
				var This = this;
				disX = touch.pageX - $(this).position().left;
				clearInterval(timer);
				$(document).on(touchmove+'.move',function(ev){
					var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
					var L = touch.pageX - disX;
					if(L<=0){
						L = 0;
					}
					else if(L >= parentW){
						L = parentW;
					}
					$(This).css('left', L );
					scale = L/parentW;
				});
				$(document).on(touchend+'.move',function(){
					$(this).off('.move');
					oAudio.currentTime = scale * oAudio.duration;
					playing();
					clearInterval(timer);
					timer = setInterval(playing,1000);
				});
				return false;
			});
		$detailsPrev.on(touchstart,function(){
			prev();
		});   
		$detailsNext.on(touchstart,function(){
			next();
		});
	}  


			function formatTime(num){  //格式日期
				num = parseInt(num);
				var iM = Math.floor(num%3600/60);
				var iS = Math.floor(num%60);
				return toZero(iM) + ':' + toZero(iS);
 			}

 			function toZero(num){
 				if(num<10){
 					return '0'+num;
 				}else{
 					return ''+num;
 				}
 			}

 		function playing(){
 			$detailsNowTime.html(formatTime(oAudio.currentTime));
 			scale = oAudio.currentTime / oAudio.duration;
 			$detailsAudioProUp.css('width',scale*100+'%');
 			$detailsAudioProBar.css('left',scale*100+'%');
 			musicDetails.scrollLyric(oAudio.currentTime);
 		}

 		function next(){
 			var $li = $listContentUl.find('li');
 			index = index == $li.length-1 ? 0 : index + 1;
 			id = $li.eq(index).attr('musicId');
 			$li.eq(index).attr('class','active').siblings().attr('class','');
 			loadMusic(id);
 		}

 		function prev(){

 			var $li = $listContentUl.find('li');
 			index = index == 0 ? $li.length-1 : index-1;
 			id = $li.eq(index).attr('musicId');
 			$li.eq(index).attr('class','active').siblings().attr('class','');
 			loadMusic(id);
 		}

 		init();

			return {
				init:init,
				loadMusic:loadMusic,
				bind:bind
			}
		})();

		init();
		
	})