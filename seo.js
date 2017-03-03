var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logg = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require("moment");
//var compression = require('compression');
var write_uuid = require('node-uuid/write_uuid');
var _check_index = require('./routes/check_index');
var report = require('./routes/seo/report_index');
var order = require('./routes/seo/order_index');
var index = require('./routes/index');
//var _step=require('./routes/step/router_step');
var _weixin_user = require('./routes/weixin/router_user');
var _fuwu = require('./routes/fuwu/router_fuwu');
var _pingc = require('./routes/pingc/router_pingc');
var _wenzhang = require('./routes/wenzhang/router_wenzhang');

moment.locale('zh-cn');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * 格式化日期串，输出指定格式
 * @param {Object} datetime
 * @param {String} datestyle
 */
app.locals.formatDate = function ( datetime, datestyle){
	d = moment( datetime, "YYYY-MM-DD HH:mm:ss");
	if(datestyle == '' || datestyle == undefined ){
		datestyle = 'YYYY-MM-DD HH:mm:ss';
	}else if( datestyle == 'd'){
		var str = '';
		switch( d.format(datestyle) ){
			case '0':
				str = '周日';
				break;
			case '1':
				str = '周一';
				break;
			case '2':
				str = '周二';
				break;
			case '3':
				str = '周三';
				break;
			case '4':
				str = '周四';
				break;
			case '5':
				str = '周五';
				break;
			case '6':
				str = '周六';
				break;
		}
		return str;
	}
	return d.format( datestyle );
}
/**
 * 获取目标日期与今天相差天数（精确到天）
 * @param {Object} datetime
 */
app.locals.formatDaysInt = function(datetime, todate) {
	if(todate == undefined){
		n = moment(moment().format('l'), "YYYY-MM-DD");
	}else{
		n = moment(todate, "YYYY-MM-DD");
	}
	d = moment(datetime, "YYYY-MM-DD");
	if(d < n){
		// 早于当前
		return 0 - n.diff(d, 'days');
	}
	return d.diff(n, 'days');
}
app.locals.getWeekMonthYear= function(birthday, recordDate) {
	 res = "";
	
	if(birthday == undefined){
		return res;
	}
	if(recordDate == undefined){
		recordDate = moment();
	}
	if( recordDate == null){
		return birthday;
	}
	s = moment(birthday, "YYYY-MM-DD");
	e = moment(recordDate, "YYYY-MM-DD");
	
//	console.log(birthday + ", " + recordDate)
//	console.log(s + ", " + e)
	isNegative = false;
	if(s.isAfter(e)){
		isNegative = true;
		// 交换
		change = s;
		s = recordDate;
		e = change;
	}
	
	 yearB = s.year();
	 monthB = (s.month()+1);
	 dayB = (s.format("DD"));
	console.log(dayB + ", " + monthB + ", " + yearB )
	
	 yearR= e.year();
	 monthR = (e.month()+1);
	 dayR = (e.format("DD"));
	console.log(dayR + ", " + monthR + ", " + yearR )

	 years = yearR - yearB;
	 days = dayR - dayB;
	 {
		daysStr = 0;
		if(days < 0){
			if(monthR == 3)
				//	①、普通年能被4整除且不能被100整除的为闰年。（如2004年就是闰年,1900年不是闰年）
				//	②、世纪年能被400整除的是闰年。(如2000年是闰年，1900年不是闰年)
				if((yearR%4==0&&yearR%100!=0)||(yearR%400==0))
					daysStr = 28;// 闰年
				else
					daysStr = 29;
			else if( monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9 || monthR == 11)
				daysStr = 31;
			else
				daysStr = 30;
		}
		daysStr = Math.floor(daysStr + days);
		// 天数差
		if(daysStr >= 7){
			daysStr = Math.floor(daysStr/7) + "周";
		}else{
			daysStr = daysStr + "天";
		}
	}
	months = monthR - monthB;
	console.log(days + ", " + months + ", " + years + " : " + daysStr)
	months = (months>0? months : 12+months);
	if(yearB == yearR){
		// 同年
		if(monthB == monthR){
			// 同年、同月
			if(dayB == dayR){
				// 同年、同月、同日
				res = "刚出生";
			}else{
				// 同年、同月、不同日
				res = (dayR - dayB) + "天";
			}
		}else{
			// 同年不同月
			if(dayB == dayR){
				// 同年、不同月、同日
				res = months + "个月";
			}else{
				// 同年、不同月、不同日
				if(dayR > dayB){
					// 天数为正差值
					res = months + "个月";
				}else{
					// 天数为负差值
					if(months > 1){
						// 月值大于1
						res = months - 1 + "个月";
					}
				}
				
				// 天数差
				res += daysStr;
			}
		}
	}else{
		// 不同年
		if(monthB == monthR){
			// 不同年、同月
			if(dayB == dayR){
				// 不同年、同月、同日
				res = years + "周岁";
			}else{
				// 不同年、同月、不同日
				if(dayR > dayB){
					// 天数为正差值
					res = years + "岁";
				}else{
					if(years > 1){
						// 月值大于1
						res = years - 1 + "岁";
					}
					// 月数差
					res += "11个月";
				}
				
				// 天数差
				res += daysStr;
			}
		}else{
			// 不同年不同月
			if(dayB == dayR){
				// 不同年、不同月、同日
				if(monthR > monthB){
					// 月差值为正
					res = years + "岁";
				}else{
					// 月差值为负
					if(years > 1){
						res = years - 1 + "岁";
					}
				}
				
				// 月数差
				res += months + "个月";
				
			}else{
				 count = 0;
				// 不同年、不同月、不同日
				if(monthR > monthB){
					// 月差值为正
					res = years + "岁";
					count ++;
				}else{
					// 月差值为负
					if(years > 1){
						res = years - 1 + "岁";
						count ++;
					}
				}

				if(dayR > dayB){
					// 天数为正差值
					res += months + "个月";
					count ++;
				}else{
					// 天数为负差值
					if(months > 1){
						res += months - 1 + "个月";
						count ++;
					}
				}
				
				if(count < 2){
					// 天数差
					res += daysStr;
				}
			}
		}
	}
	if(isNegative){
		return "出生前" + res;
	}
	return res;
}
/**
 * 求百分比，保留1位小数
 * @param {Object} x
 * @param {Object} y
 */
app.locals.percent = function(x, y) {
	if(y<=0){
		return "-";
	}
	return Math.round(1000*x/y)/10.0 + "%";
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logg('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
//app.use(compression());
app.use(write_uuid());
app.use(express.static(path.join(__dirname, 'public')));
//线索注册登录页


//app.use('/xiansuo',_step);
app.use('/',index);
app.use('/',_check_index);
app.use('/pingce',report);
app.use('/zixun',order);
app.use('/weixin', _weixin_user);

app.use('/fuwu', _fuwu);
app.use('/pingc', _pingc);
app.use('/wenzhang', _wenzhang);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.listen(8090,'0.0.0.0',function(){
    console.log('Server runing  at: website.xiaoly.com:8090');
});
//线上
//app.listen(8080,'192.168.1.205',function(){
//	console.log('server running!')-----------------++++++++++++??????222222
//});

module.exports = app;
