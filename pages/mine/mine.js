// pages/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    userPhone:'',
    inviteCode:'',
    phoneNumber:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInvestCode();
  },
  // 获取邀请码和客服电话
  getInvestCode(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnInviteCode',
          data: {
            openId: openId
          }
        }, function (res) {
          that.setData({
            inviteCode: res.inviteCode,
            phoneNumber: res.customerPhone,
            isReady:true,
            userPhone: res.phone
          })
          wx.hideLoading();
        })
      }
    })
  },
  // 跳转
  goToPage(e){
    if (!app.globalData.validation) {
      wx.showModal({
        title: '提示',
        content: '您还没有实名认证哦~',
        confirmText: '立即实名',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/certification/certification',
            })
          }
        }
      })
      return false;
    }
    const {url} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../m-pages'+url
    });
  },
  // 拨打客服电话
  callService(){
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber ,
    })
  }

})