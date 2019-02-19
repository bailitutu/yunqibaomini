// pages/m-pages/set-password/set-password.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    passOne:'',
    passTwo:''
  },
  
  changePassOne(e){
    this.setData({
      passOne:e.detail.value
    })
  },  
  changePassTwo(e){ 
    this.setData({
      passTwo: e.detail.value
    })
  },
  submitPassword(){
    var passOne = this.data.passOne;
    var passTwo = this.data.passTwo;
    if (passOne == '' || !passOne || passOne.length != 6){
      wx.showModal({
        title: '提示',
        content: '请设置六位新密码',
      })
      return false;
    }
    if (passTwo == '' || !passTwo || passTwo.length != 6) {
      wx.showModal({
        title: '提示',
        content: '请再次输入六位新密码',
      })
      return false;
    } 

    if(passOne !== passTwo){
      wx.showModal({
        title: '提示',
        content: '两次输入的密码不一致',
      })
      return false;
    }

    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEditPassword',
          data: {
            openId: openId,
            paymentPassword: passOne,
            paymentPassword2: passTwo
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '设置成功',
            success:function(){
              wx.switchTab({
                url: '/pages/mine/mine',
              })
            }
          })
        })

      } else {
        console.log(err);
        wx.hideLoading();
      }
    })


  

  }
  
})