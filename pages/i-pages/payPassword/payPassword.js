// pages/i-pages/payPassword/payPassword.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      passwordOne:'',
      passwordTwo:'',

  },
  changePassOne(e) {
    if (e.detail.value.length > 6){
      return false;
    }
    this.setData({
      passwordOne: e.detail.value
    })
  },
  changePassTwo(e){
    if (e.detail.value.length > 6) {
      return false;
    }
    this.setData({
      passwordTwo: e.detail.value
    })
  },

  submitPassword(){
    var  paymentPassword = this.data.passwordOne;
    var  paymentPassword2 = this.data.passwordTwo;
    if (paymentPassword == '' || !paymentPassword || paymentPassword.length !== 6 || paymentPassword2.length !== 6){
      wx.showToast({
        title: '请设置6位支付密码',
        icon: 'none',
        mask: true
      })
      return false;
    }
    if (paymentPassword2 == '' || !paymentPassword2) {
      wx.showToast({
        title: '请再次输入支付密码',
        icon: 'none',
        mask: true
      })
      return false;
    }
    if (paymentPassword !== paymentPassword2) {
      wx.showToast({
        title: '两次设置的密码不一致',
        icon: 'none',
        mask: true
      })
      return false;
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEditPassword',
          data: {
            openId: openId,
            paymentPassword: paymentPassword,
            paymentPassword2: paymentPassword2
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '设置成功',
            showCancel:false,
            success: function (res) {
              app.globalData.recId = res.recId;
              app.globalData.openId = '';
              setTimeout(function(){
                wx.switchTab({
                  url: '/pages/index/index',
                })
              },200)
            }
          })
        })
      }
    })
  }
})