// pages/o-pages/detail-watingRob/detail-watingRob.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady: false, //是否加载完成
    isScroll: true, //是否可滚动
    orderId: null, //订单id
    orderInfo: {}, //订单详情
    orderStatus: null, //订单状态 1已接单（待发货）2配送中3待评价 4已取消5已完成6待确认收货7待接单
    showCancel: false, //显隐取消订单的弹窗
    imgBaseUrl: '', // 图片的根路径
    timeInt:false,//是否计时
    seconds: 0, //秒
    minutes: 0, //分
    timeAll: '', //计时器
    hasTiming:false, //是否开始计时了; 
    takeOrder: false,//是否已接单
    headTips:'',
      //地图相关
    cLongitude:null,//中心经度
    cLatitude:null,//中心纬度；
    markers: [{
      iconPath: "/img/position_icon.png",
      id: 0,
      latitude: null,
      longitude: null,
      width: 22,
      height: 33
    },{
      iconPath: "/img/car_icon.png",
      id: 1,
      latitude: null,
      longitude: null,
      width: 49,
      height: 60,
      callout:{
        content:'距离你1.3km  ',
        color: '#109ba6',
        fontSize:11,
        bgColor:'#ffffff',
        borderRadius:10,
        padding:5,
        display:'BYCLICK',
        textAlign:"center"
      }
    }],
    showCancel2:false, //扣费取消订单

  },
  markertap(e) {
    const { display } = this.data.markers[1].callout;
    let dis = display == 'BYCLICK' ? 'ALWAYS' : 'BYCLICK';
    this.setData({
      'markers[1].callout.display': dis
    })

  },

  getUserHeader(){
    var imgUrl = wx.getStorageSync('userHeader')
    var markersImg = this.data.markers[0].iconPath;
    this.setData({
      [markersImg]: imgUrl
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      })
    }
    this.setData({
      imgBaseUrl: app.configUrl.baseUrl
    })
    this.init();
  },



  init(){
    var that = this;
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        that.getOrderInfoFn(openId);
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

// 新版

  getOrderInfoFn(openId){
    var that = this;
    var postData = JSON.stringify({
        orderId: that.data.orderId,
        openId: openId
    })
    wx.connectSocket({
      // url: 'ws://192.168.10.151:8080/YQB/webService',
       url: 'wss://www.yqb168.com/webService',
    })
    wx.onSocketOpen(function (res) {
      wx.sendSocketMessage({
        data: postData
      })
    })
    wx.onSocketMessage(function (res) {
      var res = JSON.parse(res.data);
      var title;
    res.goodsList.map(function(item){
      if (item.specifications === '50kg') {
        item.specName = 'YSP-50型'
      } else if (item.specifications === '15kg') {
        item.specName = 'YSP-15型'
      } else if (item.specifications === '5kg') {
        item.specName = 'YSP-5型'
      }
    });



      switch (res.orderStatus) {
        case 1:
          title = '待配送员准备气瓶';
          that.setData({
            headTips: title,
            orderStatus: res.orderStatus,
            orderInfo: res,
            isReady: true
          })

          break;
        case 2:
          title = '配送中...';
          if (that.data.cLatitude) {
            that.setData({
              headTips: title,
              orderStatus: res.orderStatus,
              orderInfo: res,
              'markers[1].latitude': res.marki.latitude,
              'markers[1].longitude': res.marki.longitude,
              'markers[1].callout.content': '  距离你' + res.distance + '  ',
            })
          } else {
            that.setData({
              headTips: title,
              orderStatus: res.orderStatus,
              orderInfo: res,
              isReady: true,
              'markers[1].latitude': res.marki.latitude,
              'markers[1].longitude': res.marki.longitude,
              'markers[1].callout.content': '  距离你' + res.distance + '  ',
              'markers[0].latitude': res.receiving.latitude,
              'markers[0].longitude': res.receiving.longitude,
              cLongitude: res.receiving.longitude,
              cLatitude: res.receiving.latitude,
            })
          }

          break;
        case 3:
          title = '配送员已到达，请进行安检审核。';
          that.setData({
            headTips: title,
            orderStatus: res.orderStatus,
            orderInfo: res,
            isReady: true
          })
          break;
        case 5:
          title = '安检审核已完成。';
          that.setData({
            headTips: title,
            orderStatus: res.orderStatus,
            orderInfo: res,
            isReady: true
          })
          break;
        case 7:
          title = '待接单';
          if (!that.data.hasTiming) {
            that.setData({
              headTips: title,
              orderStatus: res.orderStatus,
              orderInfo: res,
              isReady: true,
              hasTiming: true,
              minutes: parseInt(res.placetimeMinute),
              seconds: parseInt(res.placetimeSeconds),
              timeAll: res.placetimeMinute + ':' + res.placetimeSeconds
            })
            that.timeGoOn();
          } else {
            that.setData({
              headTips: title,
              orderStatus: res.orderStatus,
              orderInfo: res,
              timeInt: true
            })
          }

          break;
        default:
          title = '订单不存在';
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '订单异常',
            success: function () {
              wx.navigateBack();
            }
          })
          return false;
      }
    })
    wx.onSocketError(function (res) {
      wx.showModal({
        title: '提示',
        content: '系统异常',
        showCancel:false,
        success:function(){
          wx.navigateBack();
        }
      })
    })
  },
  onUnload(){
    wx.closeSocket();
  },

  // 取消订单按钮点击
  cancelOrderHander() {

    if (this.data.orderStatus == 2 || this.data.orderStatus == 3) {
      this.setData({
        showCancel2: true,
        isScroll: false,
      })
    }else{
      this.setData({
        showCancel: true,
        isScroll: false,
      })
    }

  },

  // 取消取消订单操作
  cancelHander() {
    if (this.data.orderStatus == 2 || this.data.orderStatus == 3) {
      this.setData({
        showCancel2: false,
        isScroll: true,
      })
    }else{
      this.setData({
        showCancel: false,
        isScroll: true,
      })
    }

  },
  // 确定取消订单
  confirmHander() {
    this.setData({
      showCancel: false,
      showCancel2: false,
      isScroll: true,
    })
    this.cancerOrderFn();
  },

  //取消订单
  cancerOrderFn() {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doCanOrder',
          data: {
            openId: openId,
            orderId: that.data.orderId
          }
        }, function (res) {
          wx.navigateBack();
        })
      } 
    })
  },

  // 抢单计时
  timeGoOn() {
    var that = this;
    if (timeInt) {
      clearInterval(timeInt);
    }
    var timeInt = setInterval(function () {

      if (that.data.timeInt){
        clearInterval(timeInt);
        return false;
      }
      var second = that.data.seconds;
      var minute = that.data.minutes;
      second++;
      if (second > 59) {
        second = 0;
        minute++;
      }
      that.setData({
        seconds: second,
        minutes: minute,
      })
      formateSeconds(second, minute);
    }, 1000);

    function formateSeconds(second, minute) {
      if (minute >= 60) {
        clearInterval(timeInt);
        that.cancerOrderFn();
        return false;
      }
      var t_second = second < 10 ? '0' + second : second;
      var t_minute = minute < 10 ? '0' + minute : minute;
      var timeAll = t_minute + ':' + t_second;
      that.setData({
        timeAll: timeAll
      })
    }
  },


  // 产权置换
  changeHander() {
    var orderid = this.data.orderId;
    wx.navigateTo({
      url: '/pages/o-pages/equitySwap/equitySwap?orderId=' + orderid,
    })
  },

  // 联系供应点
  callPhone(e){
    const { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  // 进入供应点
  toSupply(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../../s-pages/supply-detail/supply-detail?id=' + id,
    })
  }
  ,
  // 查看配送员资质
  checkQual(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../distributor/distributor?transitId=' + id,
    })
  },
  // 投诉
  complainTransit(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../complaint/complaint?transitId=' + id + '&orderId='+ this.data.orderId,
    })
  },

  //设置收货地址位置信息
  setRecevingInfo(){
    var recInfo = this.data.orderInfo.receiving;
     this.setData({
       'markers[0].latitude': recInfo.latitude ,
       'markers[0].longitude': recInfo.longitude,
     }) 

  },

  // 获取配送员位置信息

  getPositionInfo(){
    this.getPositionFn();

    if(getPosition){
      clearInterval(getPosition)
    }
    var that = this;
    getPosition = setInterval(function(){
      that.getPositionFn();
    },10000);
  },
  // 获取位置信息；
  getPositionFn(){
    var that = this;
    app.requestFn({
      url: '/proapi/doCoordinatesList',
      data: {
        orderId: that.data.orderId
      },
    }, function (res) {
      that.setData({
        'markers[1].latitude': res.marki.latitude,
        'markers[1].longitude': res.marki.longitude,
        'markers[1].callout.content': '  距离你' + res.distance + '  ',
      })
    }, function (err) {
      console.log(err);
    })
  },
  // 服务评价页面

  serviceHander(){
    wx.navigateTo({
      url: '../comment/comment?orderId=' + this.data.orderId,
    })
  },

  // 删除订单
  delOrderHander(){
    var that = this;
    wx.showModal({
      title:'提示',
      content:'确认删除订单？',
      success:function(res){
        if(res.confirm){
          that.deleteOrder();
        }else{
          return false;
        }
      }
    })

  },
  // 删除订单函数
  deleteOrder(){
    var that = this;
    wx.showLoading();
    app.requestFn({
      url: '/proapi/doRemoveOrder',
      data: {
        orderId: that.data.orderId
      },
    }, function (res) {
      wx.showLoading();
      wx.navigateBack();  
    })
  }

})