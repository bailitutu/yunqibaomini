  // pages/m-pages/wallet/wallet.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    myMoney:'0.00'
  },
  // 充值
  recharge(){
    wx.navigateTo({
      url: '../recharge/recharge',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getMyMoney();
  },
  getMyMoney(){

    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doLeftMoney',
          data: {
            openId: openId
          }
        }, function (res) {
          wx.hideLoading();
          var money = res.money ? res.money : '0.00'
          that.setData({
            myMoney: money,
            isReady:true
          })

        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })


  },
  // 查看交易记录
  checkHistory(){
    wx.navigateTo({
      url: '../deal-history/deal-history',
    })
  },
  // 退款
  refund(){
    wx.navigateTo({
      url: '../refund/refund',
    })
  }
})