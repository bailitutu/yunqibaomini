var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCertific:false, //是否实名
    isReady:false,//是否加载完成
    position_info:{
        lat:'',
        lng:''
    },//定位信息
    curr_address:'',  //当前地址信息
    imgList:[], //banner列表
    imgBase:'',
    hasChangeAddress:false,//是否切换了地址；
    hasBonus:false, //是否有领红包
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgBase : app.configUrl.baseUrl
      })
  },
  onShow(){
    if (this.data.hasChangeAddress){
      this.pageInit();
      this.setData({
        hasChangeAddress:false
      })
    }else{
      this.pageInit();      
    }
  },

  // 领红包
  getBonus(){

    if (!this.data.isCertific) {
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

    var that = this;
    wx.showLoading({
      title: 'Loading...',
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doAddMoneyForRes',
          data: {
            openId:openId
          }
        }, function (res) {
          wx.hideLoading();
          that.setData({
            hasBonus:false
          })
          wx.showToast({
            title: '领取成功！',
            icon:'none',
            mask:true
          })
        }) 
      }
    });
  },
  // 不领红包
  noGetBonus(){
    this.setData({
      hasBonus: false
    })

  },
  // banner跳转
  bannerHandle(e){
    const { id } = e.currentTarget.dataset;
    var  url = '';
    switch (id){
      case "1":
        url = '../i-pages/recommend/recommend';
        break;
      case "2":
        if (!this.data.isCertific) {
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
        url = '../i-pages/answerTest/answerTest';
        break;
      case "3":
        if (!this.data.isCertific) {
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
        url = '../m-pages/recharge/recharge';
        break;
      default:
        return false;
    }
    wx.navigateTo({
      url: url,
    })



  },

  // 初始化页面
  pageInit: function ( ) {
    var that = this;
    app.getUserOpenId(function(err,openId){
      if(!err){
        if (!app.globalData.recId) {
          that.getUserPosition(openId);
        } else {
          that.getPageData({
            openId: openId,
            recId: app.globalData.recId,
          });
        }        
      }
    });

  },

  // 获取页面数据

  getPageData(postData){
    var that = this;
    wx.showToast({
      icon:'loading',
      title:'Loading...',
      mask:true
    })
    app.requestFn({
      url: '/proapi/doSelAllSpec',
      data: postData
    }, function (res) {
      var isVal = res.validation == 1 ? true : false;
      app.globalData.validation = isVal;

      if (res.specList){
        res.specList.map(function (item) {
          if (item.specifications === '50kg') {
            item.specName = 'YSP-50型'
          } else if (item.specifications === '15kg') {
            item.specName = 'YSP-15型'
          } else if (item.specifications === '5kg') {
            item.specName = 'YSP-5型'
          }
        })

        that.setData({
          imgList: res.imgList,
          isReady: true,
          specList: res.specList,
          isCertific: isVal,
          curr_address: res.adress,
          hasBonus: res.isReceive

        })
        wx.hideToast();

      }else{
        that.setData({
          imgList: res.imgList,
          isReady: true,
          specList: res.specList,
          isCertific: isVal,
          curr_address: res.adress,
          hasBonus: res.isReceive

        })
        wx.hideToast();
      }


    })
  },
  // 获取用户当前位置
  getUserPosition(openId){
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.getPageData({
          openId: openId,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail:function(){
        wx.showModal({
          title: '提示',
          content: '定位失败，请先实名认证！',
          success:function(res){
            if(res.confirm){
              wx.navigateTo({
                url: '/pages/certification/certification',
              })
            }else{
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      }
    })
  },
  // 选择收货地址
  selectAddress(){
    wx.navigateTo({
      url: '../i-pages/select-address/select-address',
    })
  },


  // 进入对应页面
  goToPage(e) {
    const { check,url } = e.currentTarget.dataset;
    if ( check && !this.data.isCertific) {
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
    wx.navigateTo({
      url:url
    });
  },
  // 进入订单列表进行产权置换
  equitySwapFn(){
    if (!this.data.isCertific) {
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

    wx.switchTab({
      url: '/pages/order/order',
    })
  },
  

  // 无瓶开户
  openingFn(e){
    if (!this.data.isCertific) {
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
    const { spec }  = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/i-pages/opening/opening?spec=' + spec
    })
  },
  // 有瓶换气
  changeGasFn(e) {
    if (!this.data.isCertific) {
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
    const { spec } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/i-pages/changeGas/changeGas?spec=' + spec
    })
  }
})