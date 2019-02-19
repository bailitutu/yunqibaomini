// pages/m-pages/deal-detail/deal-detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHistoryDetail(options.id)
  },
  getHistoryDetail(id){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doEntransactionDetail',
      data: {
        transactionid: id
      }
    }, function (res) {
      that.setData({
        isReady:true,
        info: res
      })
      wx.hideLoading();

    }, function (err) {
      console.log(err);
      wx.hideLoading();
    })
  }
  
})