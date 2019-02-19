// pages/m-pages/refund/refund.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    refundMoney:'0.00',
    refundCard:'',//卡号
    refundName:'',//持卡人
    refundBankName:'', //开户银行
    city:'',//开卡城市
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.pageInit();
  },
  // 获取退款金额
  pageInit(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {

        app.requestFn({
          url: '/proapi/doRefundMoney',
          data: {
            openId: openId
          }
        }, function (res) {
          that.setData({
            refundMoney: res.money,
            isReady:true
          })
          wx.hideLoading();

        })
      }
    })
  },

  // 填写相关信息
  changeInput(e){
    const {param} = e.currentTarget.dataset;
    this.setData({
      [param]: e.detail.value
    })

  },
  //申请退款

  applyRefund(){

    const { refundCard, refundName, refundMoney, refundBankName,city} = this.data;
    if (!refundMoney || refundMoney == '0.00') {
      wx.showModal({
        title: '提示',
        content: '无可退金额',
      })
      return false;
    }
    if (!refundName || refundName == '') {
      wx.showModal({
        title: '提示',
        content: '请输入持卡人姓名',
      })
      return false;
    }

    if (!refundBankName || refundBankName == '') {
      wx.showModal({
        title: '提示',
        content: '请输入开户银行',
      })
      return false;
    }
    if (!refundCard || refundCard == ''){
      wx.showModal({
        title: '提示',
        content: '请输入退款银行卡',
      })
      return false;
    }
    if (!city || city == '') {
      wx.showModal({
        title: '提示',
        content: '请输入开卡城市',
      })
      return false;
    }
    wx.showLoading({
      title: '申请中...',
      mask:true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnRefund',
          data: {
            openId: openId,
            amount: refundMoney,
            openName:refundName,
            account:refundCard,
            city:city,
            bankName: refundBankName
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '申请成功，待处理',
            showCancel:false,
            success:function(){
              wx.navigateBack();
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