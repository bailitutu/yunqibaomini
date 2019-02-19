// pages/m-pages/gas-jar/gas-jar.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    gasJarList:[],
    imgBase:null,
    noContentTips:'您还没有气瓶哦！'
  },
  checkGasjar(e){
    var jarId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../gas-detail/gas-detail?jarId=' + jarId
    })
  },

  getGasJarList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnProperty',
          data: {
            openId: openId
            }
        }, function (res) {
    
          that.setData({
            gasJarList: res.goods,
            isReady: true
          })
          wx.hideLoading();   
        })
      } else {
        wx.hideLoading();
      }
    })
  },
  onLoad: function (options) {
    this.setData({
      imgBase:app.configUrl.baseUrl
    })
    this.getGasJarList();
  }


})