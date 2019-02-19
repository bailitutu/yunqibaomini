var app = getApp();
Page({
  data:{
    isReady:false,
    brandList:[],//品牌列表
    purList:[], //用途列表
    multiArray: [], //品牌用途数组
    multiIndex:[0,0], //品牌用途下标
    array: [], //送达时间
    index: 0, //送达时间下标,
    hasCheckNotes: false,// 是否阅读并同意开户须知；
    shopNum:1,//购买数量
    spec:'', //所选规格
    hasSelectJar:false,//是否选择了气瓶
    jarBrand: null,//选择的品牌
    jarUse: null,//选择的用途
    couponType:0, //优惠券类型
    couponId:'', //优惠券ID
    couponName:'',// 优惠券名称
    hasEnableDiscount: false, //是否有可用优惠券
    markiFee: '0.00', //配送费
    platformFee: '0.00', //燃气费
    totalPrice: '0.00',//总价
    propertyFee: '0.00', // 保证金，
    isActivity:true,//是否在活动期间
    showPayItem: false, //支付界面
    payIsFocus: false, //弹出键盘
    payPass: '', //支付密码
    notFunds:false, //余额不足
    payWayArr: ['钱包支付', '微信支付'],//支付方式数组;
    payWayIndex: 0,
  },

  onLoad:function(option){
    if(option.spec){
      this.setData({
        spec:option.spec
      })
    }
    this.getPageData();
  },

  onShow(){
    if (this.data.couponId) {
      this.getPrice();
    }
  },
  // 获取页面数据
  getPageData(){
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    var that = this;
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnterOrder',
          data: {
            openId: openId,
            recId:app.globalData.recId,
            specifications:that.data.spec
          }
        }, function (res) {
          var brandList = [];
          if (res.allList.brandlist) {
            res.allList.brandlist.map(function (item) {
              brandList.push(item.brand)
            });
          }
          that.setData({
            array: res.timeList,
            purList: res.allList.purList,
            brandList: res.allList.brandlist,
            multiArray: [brandList,res.allList.purList[0]],
            isReady:true,
            isActivity:res.isActive
          })
          wx.hideLoading();
        })

      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },


  // 选择品牌用途
  bindMultiPickerChange: function (e) {
    var data = {
      hasSelectJar: true,
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
      jarBrand: this.data.multiArray[0][this.data.multiIndex[0]],
      jarUse: this.data.multiArray[1][this.data.multiIndex[1]],
      spec: this.data.spec,
      couponId: null,
      couponName: '',
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    var userType = this.data.multiArray[1][this.data.multiIndex[1]];
    var couponType;
    switch (data.jarUse) {
      case '民用':
        couponType = '1';
        break;
      case '商用':
        couponType = '2';
        break;
      case '工用':
        couponType = '3';
        break;
      default:
        return false;
    }
    let brandIndex = this.data.multiIndex[0];
    if (this.data.brandList[brandIndex].isCooperation == '0') {
      wx.showToast({
        title: '该品牌暂未合作，请选择其他品牌',
        icon: 'none',
        duration: 3000
      })
      return false;
    }
    data.couponType = couponType;
    this.setData(data);
    this.getPrice();

  },
 // 选择气瓶品牌、用途、规格的选择
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
      brandList: this.data.brandList,
      purList:this.data.purList
    }
    data.multiIndex[e.detail.column] = e.detail.value;

    if(e.detail.column === 0){
      for (var i = 0; i < data.brandList.length; i++) {
        if (i == e.detail.value) {
          data.multiArray[1] = data.purList[i];
          data.multiIndex[1] = 0;
        }
      }
    }
    this.setData(data);
  },

 // 获取价格信息
  getPrice:function(){
    var that = this;
    let { jarBrand, spec, couponType, shopNum, couponId, banDiscount } = this.data;
    if (banDiscount) {
      couponId = '';
    }
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doSelBrand',
          data: {
            recId: app.globalData.recId,
            brand: jarBrand,
            specifications: spec,
            purpose: couponType,
            discountId: couponId,
            openId: openId,
            orderType: 4,
            num: shopNum
          }
        }, function (res) {
          that.setData({
            hasEnableDiscount: res.discountHave,
            markiFee: res.markifee,
            platformFee: res.platformfee,
            totalPrice:res.total,
            propertyFee: res.propertyfee
          })
          wx.hideLoading();
        })
      } 
    })

  },
 

  // 送达时间
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 添加购买商品时，减数量
  noAddShopNum(e) {
    let { num } = e.currentTarget.dataset;
    num--;
    if (num < 1) {
      return false;
    }

    this.setData({
      shopNum: num,
    })
    this.getPrice();
  },

  // 添加购买商品时，加数量
  addShopNum(e) {
    if (this.data.isActivity) {
      wx.showToast({
        title: '活动期间限购一瓶',
        icon: 'none'
      })
      return false;
    }
    let { num } = e.currentTarget.dataset;
    num ++;
    this.setData({
      shopNum: num,
    })
    this.getPrice();
  },
  // 选择优惠券
  selectCoupon(e){
      const { able } = e.currentTarget.dataset;
      if(!able){
        return false;
      }
      var spec = this.data.spec;
      var couponId = this.data.couponId;
    wx.navigateTo({
      url: '/pages/i-pages/select-coupon/select-coupon?couponId=' + couponId + '&specifications=' + spec,
    })
  },
  // 查看须知
  checkNotes(){
    wx.navigateTo({
      url: '/pages/i-pages/openingNotes/openingNotes',
    })
  },
  // 阅读须知
  aggressNotes(){
    var hasCheckNotes = this.data.hasCheckNotes;
    this.setData({
      hasCheckNotes: !hasCheckNotes
    }) 
  },
  // 立即开户
  submit(){
    if (!this.data.hasSelectJar){
      wx.showToast({
        title: '请选择气瓶品牌及用途',
        icon: 'none'
      })
      return false;
    }

    if (!this.data.hasCheckNotes) {
      wx.showToast({
        title: '请先阅读开户须知',
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
  closePay(){
    this.setData({
      showPayItem:false,
      isScroll: true,
    })
  },

  set_Focus(){
    this.setData({
      payIsFocus:true
    })
  },

  set_wallets_password(e){
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

  submitPlace(){
      wx.showLoading({
        title: "Loading...",
        mask: true
      })
      var that = this;
    const { shopNum, jarBrand, spec, couponType, couponId, markiFee, propertyFee, platformFee, totalPrice, payPass, array, index } = this.data;
      app.getUserOpenId(function (err, openId) {
        if (!err) {
          app.requestFn({
            url: '/proapi/doNowOrder',
            data: {
              openId: openId,
              recId: app.globalData.recId,
              num: shopNum,
              brand: jarBrand,
              specifications: spec,
              purpose: couponType,
              couponsId: couponId,
              markiFee: markiFee,
              propertyFee: propertyFee,
              platformFee: platformFee,
              total: totalPrice,
              orderType: 4,
              orderSource: 1,
              paymentPassword: payPass,
              sentTime: array[index]
            }
          }, function (res) {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '下单成功',
              showCancel:false,
              success:function(){
                wx.switchTab({
                  url: '/pages/order/order',
                })
              }
            })
            }, function (dat) {
                wx.hideLoading();
                if (dat.data.head.respCode === '0005002') { //余额不足
                  that.setData({
                    notFunds: true,
                  })
                } else if (dat.data.head.respCode === '2000006'){
                  wx.showModal({
                    title: '提示',
                    content: '优惠券已被使用，请重新下单',
                    showCancel: false,
                    success:function(){
                      that.resetOrderInfo();
                    }
                  })
                } else{
                  wx.showModal({
                    title: '提示',
                    content: dat.data.head.respContent,
                    showCancel:false
                  })
                }
              })

        }
      })

    },
 // 去充值
  goRecharge() {
    this.setData({
      isScroll:true,
      notFunds:false
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
    if (!this.data.hasSelectJar) {
      wx.showToast({
        title: '请选择气瓶品牌及用途',
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
        that.getPrice();
      },
    })
  },

  // 微信支付订单
  wxPayOrder() {
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    var that = this;
    const { shopNum, jarBrand, spec, markiFee, propertyFee, platformFee, totalPrice, payPass, array, index } = this.data;
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doNowOrder',
          data: {
            openId: openId,
            recId: app.globalData.recId,
            num: shopNum,
            brand: jarBrand,
            specifications: spec,
            markiFee: markiFee,
            propertyFee: propertyFee,
            platformFee: platformFee,
            total: totalPrice,
            orderType: 4,
            orderSource: 1,
            paymentPassword: payPass,
            sentTime: array[index],
            paymentMethod: 1, //代表微信支付
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

        }, function (dat) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: dat.data.head.respContent,
            showCancel: false
          })
        })
      }
    })
  }
})