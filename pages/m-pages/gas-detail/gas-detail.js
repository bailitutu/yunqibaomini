// pages/m-pages/gas-detail/gas-detail.js
var app = getApp();
Page({

  data: {
    ready:false,
    imgBase:null,
    gasJarInfo:{}
  },

  onLoad: function (options) {
    if (options.jarId){
      this.getGasInfo(options.jarId);
    }
    this.setData({
      imgBase:app.configUrl.baseUrl
    })
  },
  getGasInfo(jarId){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });

    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnPropertyRead',
          data: {
            openId: openId,
            propertyId:jarId
          }
        }, function (res) {
          that.setData({
            ready: true,
            gasJarInfo: res
          })
          wx.hideLoading();
        });
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
    


  },
  
  callPhone(e) {
    const { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  }

})
