// pages/m-pages/check-password/check-password.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldPass:''
  },

  inputPass(e){
    this.setData({
      oldPass:e.detail.value
    })
  },
  setNewPass(e){
    var oldpass = this.data.oldPass
    if(oldpass== '' || !oldpass){
      wx.showModal({
        title: '提示',
        content: '请输入原支付密码',
      })
      return false;
    }else if(oldpass.length != 6){
      wx.showModal({
        title: '提示',
        content: '请输入6位支付密码',
      })
      return false;
    }
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doProvingpassword',
          data: {
            openId: openId,
            paymentPassword: oldpass
          }
        }, function (res) {
          wx.navigateTo({
            url: '../set-password/set-password'
          })

        }, function (err) {
          if (err.data.head.respCode === '0001004') {
            wx.showModal({
              title: '提示',
              content: '密码验证失败',
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '系统异常',
            })
          }

        });
      } else {
        wx.hideLoading();
      }
    })


    



  
  },
 
})