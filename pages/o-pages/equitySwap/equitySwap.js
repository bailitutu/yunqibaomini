// pages/o-pages/equitySwap/equitySwap.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    isReady:false,
    orderId:null,
    hasCheckNotes:false,
    pageData:{}, //页面数据
    discount:0, //折价
    replacementfee:"0.00" ,//置换费
    oldSerial:'', //原瓶号
    oldBrand:'', //原品牌
    supplyName:'', //服务供应点
    showPayItem: false, //支付界面
    payIsFocus: false, //弹出键盘
    payPass: '', //支付密码
    notFunds: false, //余额不足
    payWayArr: ['钱包支付', '微信支付'],//支付方式数组;
    payWayIndex: 0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.orderId){
      this.setData({
        orderId:options.orderId
      })
    }

    this.getPageData();
  },
  
  getPageData(){

    var that = this;
    var orderId = this.data.orderId;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doPropertyOrder',
          data: {
            openId: openId,
            orderId: orderId
          }
        }, function (res) {
          var fee = res.discount
          that.setData({
            pageData:res,
            isReady: true
          })
          that.getPrice();
          wx.hideLoading();
        })
      } 
    })


  },
  // 填写品牌
  changeBrand(e){
    this.setData({
      oldBrand: e.detail.value
    })
  },
  // 填写旧瓶号；
  changeSerial(e) {
    this.setData({
      oldSerial: e.detail.value
    })
  },
  // 填写服务供应点
  changeSupply(e) {
    this.setData({
      supplyName: e.detail.value
    })
  },

  // 减金额
  noAddShopNum(e) {
    let { num } = e.currentTarget.dataset;
    num = parseInt(num) - 10;
    if (num < 0) {
      return false;
    }
    this.setData({
      discount: num,
    })
    this.getPrice();
  },

  // 加金额
  addShopNum(e) {
    let { num } = e.currentTarget.dataset;
    num = parseInt(num) + 10;
    if (num >= this.data.pageData.propertyfee){
      return false;
    }
    this.setData({
      discount: num,
    })
    this.getPrice();
  },

  // 获取产权置换费
  getPrice(){
    var discount = this.data.discount; //折价
    var margin = this.data.pageData.propertyfee; //保证金
    var replacementfee = ((margin - discount)*100/100).toFixed(2);
    this.setData({
      replacementfee: replacementfee
    })
  },
  
  // 查看须知
  checkNotes() {

    wx.navigateTo({
      url: '/pages/i-pages/swapNotes/swapNotes',
    })
  },
  // 阅读须知
  aggressNotes() {
    var hasCheckNotes = this.data.hasCheckNotes;
    this.setData({
      hasCheckNotes: !hasCheckNotes
    })
  },


  // 立即置换
  submit() {
    if (this.data.oldBrand == '' || !this.data.oldBrand) {
      wx.showToast({
        title: '请输入原气瓶品牌',
        icon: 'none'
      })
      return false;
    }

    if (this.data.oldSerial == '' || !this.data.oldSerial) {
      wx.showToast({
        title: '请输入原气瓶号',
        icon: 'none'
      })
      return false;
    }
    if (!this.data.hasCheckNotes) {

      wx.showToast({
        title: '请先阅读产权置换须知',
        icon: 'none'
      })
      return false;
    }

    const { payWayIndex } = this.data;
    if (payWayIndex == 0 || !payWayIndex) {
      // 钱包支付
      this.setData({
        showPayItem: true,
        isScroll: false,
        payIsFocus: true,
        payPass: '',
      })
    } else {
      // 微信支付
      this.wxPayOrder();
    }
  },

  //   // 输入支付密码
  closePay() {
    this.setData({
      showPayItem: false,
      isScroll: true,
    })
  },

  set_Focus() {
    this.setData({
      payIsFocus: true
    })
  },

  set_wallets_password(e) {
    if (this.data.payPass.length > 6) {
      this.setData({
        payIsFocus: false
      })
      return false;
    }
    this.setData({
      payPass: e.detail.value
    });
    if (this.data.payPass.length == 6) {//密码长度6位时，自动验证钱包支付结果
      this.setData({
        showPayItem: false,
        isScroll: true,
        payIsFocus: false
      });
      this.submitPlace();
    }

  },

  // 提交置换
  submitPlace() {
    var that = this;

    var postData = {
      orderId: this.data.orderId,
      newSerial: this.data.oldSerial,
      newBrand: this.data.oldBrand,
      supplyName: this.data.supplyName,
      filling: this.data.filling,
      discount: this.data.discount,
      margin: this.data.pageData.propertyfee,
      replacementfee: this.data.replacementfee,
      paymentPassword: this.data.payPass
    }
    wx.showLoading({
      title: "提交中...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        postData.openId = openId;
        app.requestFn({
          url: '/proapi/doSavePropertyOrder',
          data: postData
        }, function (res) {
          wx.showToast({
            title: '支付成功',
            success(){
              setTimeout(()=>{
                wx.switchTab({
                  url: '/pages/order/order',
                })
              },2000)
            }
          })

          wx.hideLoading();
         
        }, function (dat) {
            wx.hideLoading();
            if (dat.data.head.respCode === '0005002') { //余额不足
              that.setData({
                notFunds: true,
              })
            } else {
              wx.showModal({
                title: '提示',
                content: dat.data.head.respContent,
                showCancel: false
              })
            }
          })
      }
    })


  },
  // 去充值
  goRecharge() {
    this.setData({
      notFunds: false
    })
    wx.navigateTo({
      url: '/pages/m-pages/recharge/recharge',
    })
  },

  // 不去充值
  cancleRecharge() {
    this.setData({
      notFunds: false,
    })
  },
  //选择支付方式
  selectPayWay() {
    const that = this;
    const { payWayArr } = this.data;
    wx.showActionSheet({
      itemList: payWayArr,
      success: function (res) {
        if (res.tapIndex == 1) {
          that.setData({
            payWayIndex: res.tapIndex,
          })
        } else {
          that.setData({
            payWayIndex: res.tapIndex,
          })

        }
      },
    })
  },
  // 微信支付订单
  wxPayOrder() {
    var that = this;
    var postData = {
      orderId: this.data.orderId,
      newSerial: this.data.oldSerial,
      newBrand: this.data.oldBrand,
      supplyName: this.data.supplyName,
      filling: this.data.filling,
      discount: this.data.discount,
      margin: this.data.pageData.propertyfee,
      replacementfee: this.data.replacementfee,
      paymentMethod: 1,
      orderSoure:3,
    }
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        postData.openId = openId;
        app.requestFn({
          url: '/proapi/doSavePropertyOrder',
          data: postData
        }, function (res) {
          wx.hideLoading();
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': 'MD5',
            'paySign': res.paySign,
            'success': function (res) {
              wx.showToast({
                title: '支付成功！',
                success:function(){
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/order/order',
                    })
                  }, 2000)
                }
              })
          
            },
            'fail': function (res) {
              wx.showModal({
                title: '提示',
                content: '支付失败，请重试',
                success: function (ress) {
                  return false;
                }
              })
            }
          })
        })
      } else {
        wx.hideLoading();
      }
    })
  }

})
