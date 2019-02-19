// pages/m-pages/recharge/recharge.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:true,
    rechargeMoney:'',//充值金额
    re_type:'', //充值类型，
    couponsList1:[],
    couponsList2:[],
    couponsList3:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDiscoutList();
  },

  getDiscoutList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doSelAllCoupons'
    }, function (res) {
      that.setData({
        couponsList1: res.coLists[0],
        couponsList2: res.coLists[1],
        couponsList3: res.coLists[2],
        isReady:true
      })
      wx.hideLoading();
    }, function (err) {
      console.log(err);
      wx.hideLoading();
    })
  },
  rechargeFn() {
    var that = this;
    var money = this.data.rechargeMoney;
    var re_type = this.data.re_type;
    
    if(money == '' || !money){
      wx.showModal({
        title: '提示',
        content: '请选择充值金额',
      })
      return false;
    }
    wx.showToast({
      icon:'loading',
      title:'Loading...'
    });

    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doWxPay',
          data: {
            openId: openId,
            money: money,
            type: re_type
          }
        }, function (res) {
          wx.hideLoading();
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': 'MD5',
            'paySign': res.paySign,
            'success': function (res) {
              wx.showModal({
                title: '提示',
                content: '充值成功！',
                showCancel:false,
                success:function(){
                  wx.navigateBack();
                }
              })
            },
            'fail': function (res) {
              wx.showModal({
                title: '提示',
                content: '支付失败，请重试',
                success: function (ress) {
                  if (ress.confirm) {
                    return false;
                  } else if (ress.cancel) {
                    wx.navigateBack();
                  }
                }
              })
            }
          })
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  selectPrice(e){
    const { type, price } = e.currentTarget.dataset;
    this.setData({
      re_type:type,
      rechargeMoney: price
    })
  },
  checkDesc(){
    wx.navigateTo({
      url: '../rechargeNotes/rechargeNotes',
    })
  }
  
})

