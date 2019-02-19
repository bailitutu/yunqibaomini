var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    notFunds:false,
    isScorll:true,
    supplyId:'',//供应点ID
    addressId:'', //收货地址
    goodBrand:'',//气瓶品牌
    goodAttr:'', //气瓶规格
    couponId:'',//优惠券ID
    couponName:'请选择',//优惠券名称
    goodId:'', //商品ID
    hasCoupon:false, //有无可用优惠券
    sentTime:'',//配送时间
    hasPurpose:false,//是否有选择用途
    purpose:'', //用途
    purposeId:"",
    timeList:[],//送达时间数组
    timeIndex:0, //送达时间下标
    array: ['民用','商用','工用'], //用途
    index: 0, //送达时间下标,
    orderType:'', //下单类型,
    goodsId:'',
    orderInfo:{},
    imgBase:null,
    showPayItem: false,//显隐支付弹窗
    payIsFocus: false, //支付聚焦
    payPass: '',
    payWayArr: ['钱包支付', '微信支付'],//支付方式数组;
    payWayIndex: 0,
    banDiscount:false, //是否禁用优惠券
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (options.orderType) {
        this.setData({
          orderType: options.orderType
        })
      }
      if (options.goodBrand) {
        this.setData({
          goodBrand: options.goodBrand
        })
      }
      if (options.supplyId) {
        this.setData({
          supplyId: options.supplyId
        })
      }
      if (options.goodAttr) {
        this.setData({
          goodAttr: options.goodAttr
        })
      }
      this.setData({
        imgBase: app.configUrl.baseUrl,
        addressId:app.globalData.recId
      })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.getOrderInfo();

  },
  onHide:function(){
    this.setData({
      isReady:false
    })
  },
  // 获取订单信息
  getOrderInfo(){
    let { addressId,
      couponId,
      goodAttr,
      goodBrand,
      purposeId,
      orderType,
      supplyId ,
      banDiscount} = this.data;
    var that = this;
    if (banDiscount) {
      couponId = '';
    }
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doFirmOrder',
          data: {
            supplyId: supplyId,
            openId: openId,
            couponId: couponId,
            recId: addressId,
            purpose: purposeId,
            orderType: orderType,
            specifications :goodAttr,
            brand: goodBrand
          }
        }, function (res) {
          
          that.setData({
            orderInfo: res,
            isReady:true,
            timeList: res.timeList,
            sentTime:res.timeList[0],
            goodsId: res.yGoodsList ? res.yGoodsList[0].id : '' 
          })

          wx.hideLoading();

        })
      } 
    }) 
  },

  // 选择送达时间
  bindChangeTime: function (e) {
    this.setData({
      timeIndex: e.detail.value,
      sentTime: this.data.timeList[e.detail.value]
    })
    
  },
  // 选择商品用途
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value,
      hasPurpose: true,
      purpose: this.data.array[e.detail.value],
      purposeId: Number(e.detail.value)+1,
    })
    this.getOrderInfo();
  },

  // 选择收货地址
  selectAddress(){
    wx.navigateTo({
      url: '/pages/s-pages/select-address/select-address?addressId=' + this.data.addressId + ' &supplyId=' + this.data.supplyId,
    })

  },
  // 选择优惠券
  selectCoupon(e){
    const {able} = e.currentTarget.dataset;
    if(!able){
        return false;
    }else{
      let couponId = !this.data.couponId ? null : this.data.couponId;
      let goodAttr = this.data.goodAttr;
      wx.navigateTo({
        url: '/pages/s-pages/select-discounts/select-discounts?couponId=' + couponId + '&specifications=' + goodAttr,
      })
    }

  },

  // 点击下单
  placeHander() {
    var data = this.data;

    if (!data.addressId || data.addressId == '') {
      wx.showModal({
        title: '提示',
        content: '请先选择收货地址',
      })
      return false;
    }
    if (!data.purpose || data.purpose == '') {
      wx.showModal({
        title: '提示',
        content: '请先选择气瓶用途',
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

  // 输入支付密码
  closePay(){
    this.setData({
      showPayItem: false,
    })
  },

  set_Focus(){
    this.setData({
      payIsFocus: true
    })
  },

  set_wallets_password(e){
    if(this.data.payPass.length > 6) {
      this.setData({
        payIsFocus: false
      })
      return false;
    }
    this.setData({
      payPass: e.detail.value
    });
    if(this.data.payPass.length == 6) {//密码长度6位时，自动验证钱包支付结果
      this.setData({
        showPayItem: false,
        payIsFocus: false
      });
      this.submitPlace();
    }

  },

  submitPlace(){
    var that = this;
    const { orderInfo, payPass, addressId, couponId, sentTime, goodsId} = this.data
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doAddOrder',
          data: {
            openId: openId,
            regId: addressId,
            couponId: couponId,
            coupons: orderInfo.coupon,
            markifee: orderInfo.markifee,
            orderType: orderInfo.orderType,
            paymentPassword: payPass,
            total: orderInfo.total,
            sentTime: sentTime,
            goodsId:goodsId,
            orderSource:2,
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '下单成功',
            showCancel:false,
            success:function(da){
              wx.switchTab({
                url: '/pages/order/order',
              })
            }
          })
     
        }, function (dat) {
          wx.hideLoading();          
          if (dat.data.head.respCode === '0005002') { //余额不足
            that.setData({
              notFunds:true,
              isScorll:false
            })
            return false
          } else {
            wx.showModal({
              title: '提示',
              content: dat.data.head.respContent
            })
            return false
          }
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })


  },

    // 去充值
  goRecharge(){
    this.setData({
      isScroll: true,
      notFunds: false
    })
    wx.navigateTo({
      url: '/pages/m-pages/recharge/recharge',
    })
  },

  // 不去充值
  cancleRecharge(){
    this.setData({
      notFunds:false,
      isScorll:true,
    })
  },
  //选择支付方式
  selectPayWay() {
    const that = this;
    if (!this.data.hasPurpose) {
      wx.showToast({
        title: '请选择气瓶用途',
        icon: 'none'
      })
      return false;
    }
    const { payWayArr } = this.data;
    wx.showActionSheet({
      itemList: payWayArr,
      success: function (res) {
        if (res.tapIndex == 1) {
          that.setData({
            payWayIndex: res.tapIndex,
            banDiscount: true,
          })
        } else {
          that.setData({
            payWayIndex: res.tapIndex,
            banDiscount: false,
          })

        }
        that.getOrderInfo();
      },
    })
  },
  
  // 微信支付订单
  wxPayOrder() {
    var that = this;
    const { orderInfo, payPass, addressId, sentTime, goodsId } = this.data
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doAddOrder',
          data: {
            openId: openId,
            regId: addressId,
            markifee: orderInfo.markifee,
            orderType: orderInfo.orderType,
            total: orderInfo.total,
            sentTime: sentTime,
            goodsId: goodsId,
            orderSource: 2,
            paymentMethod: 1,
          }
        }, function (res) {
          wx.hideLoading();
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': 'MD5',
            'paySign': res.paySign,
            'success': function (res) {
              wx.showModal({
                title: '提示',
                content: '下单成功！',
                confirmText: '查看订单',
                showCancel: false,
                success: function () {
                  wx.switchTab({
                    url: '/pages/order/order',
                  })
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
        console.log(err);
        wx.hideLoading();
      }
    })
  }


})