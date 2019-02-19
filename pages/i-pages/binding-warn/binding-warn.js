// pages/i-pages/binding-warn/binding-warn.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gasWranCode:null
  },
  inputCode(e){
    this.setData({
      gasWranCode:e.detail.value
    })
  },
  // 绑定报警器
  bindingFn(){
    if (this.data.gasWranCode == '' || !this.data.gasWranCode){
      wx.showModal({
        title: '提示',
        content: '请先输入报警器编号',
      })
      return false;
    }

    var that = this;
    wx.showLoading({
      title:'Loading...',
      mask: true
    });

    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doAddAlarm',
          data: {
            openId: openId,
            code: that.data.gasWranCode
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '绑定成功！',
            showCancel:false,
            success:function(){
              wx.navigateBack();
            }
          })
        })
      } else {
        wx.hideLoading();
      }
    })

  }
})